import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  runTransaction,
  Timestamp,
  onSnapshot,
  Unsubscribe,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { Group } from '../types';

const GROUPS = 'groups';
const USERS = 'users';

const mapGroupError = (code: string) => {
    switch (code) {
        case 'not-found': return "This group doesn't exist anymore.";
        case 'already-member': return "You're already in this group!";
        case 'invalid-code': return "Invalid invite code. Double-check and try again.";
        case 'permission-denied': return "You don't have permission to do that.";
        case 'create-failed': return "Couldn't create the group. Please try again.";
        default: return "An unexpected error occurred.";
    }
};

// Generate a unique 6-character alphanumeric invite code
export const generateInviteCode = async (): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const groupQuery = query(collection(db, GROUPS), where('inviteCode', '==', code));
  const querySnapshot = await getDocs(groupQuery);
  if (!querySnapshot.empty) {
    return generateInviteCode();
  }
  return code;
};

// Create a new group
export const createGroup = async (name: string, color: string, userId: string): Promise<{ id: string, inviteCode: string }> => {
  try {
    const inviteCode = await generateInviteCode();
    const groupRef = await addDoc(collection(db, GROUPS), {
      name,
      color,
      createdBy: userId,
      createdAt: serverTimestamp(),
      members: [userId],
      inviteCode,
      movieCount: 0,
      lastActivity: serverTimestamp(),
    });
    const userRef = doc(db, USERS, userId);
    await updateDoc(userRef, {
      groupIds: arrayUnion(groupRef.id),
    });
    return { id: groupRef.id, inviteCode };
  } catch (error) {
    console.error("Error creating group:", error);
    throw new Error(mapGroupError('create-failed'));
  }
};

// ====================================================================================
// DEBUG-ENHANCED REAL-TIME GROUP FETCHER
// ====================================================================================
// This function listens for real-time updates to the user's groups.
// It now includes an `onError` callback to pass Firestore errors back to the component.
//
// LIKELY ISSUE: The query below uses `where` on 'members' and `orderBy` on 'lastActivity'.
// This requires a composite index in Firestore. If the index is missing, Firestore
// will reject the query. The `onError` callback will catch this and display a helpful
// error message in the UI, often with a direct link to create the index.
// ====================================================================================
export const onUserGroupsSnapshot = (
    userId: string, 
    onUpdate: (groups: Group[]) => void, 
    onError: (error: Error) => void
): Unsubscribe => {
    console.log('[groupService] Subscribing to groups for user:', userId);

    const q = query(
        collection(db, GROUPS),
        where('members', 'array-contains', userId),
        orderBy('lastActivity', 'desc')
    );

    console.log('[groupService] Using query:', q);

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        console.log(`[groupService] Snapshot updated. Found ${snapshot.docs.length} document(s).`);
        if (snapshot.metadata.hasPendingWrites) {
          console.log('[groupService] Data is from a local write.');
        }

        const groups = snapshot.docs.map(doc => {
            const data = doc.data();
            // Fallback for missing lastActivity field
            if (!data.lastActivity) {
                console.warn(`[groupService] Group ${doc.id} is missing 'lastActivity'. Defaulting to 'createdAt'.`);
                data.lastActivity = data.createdAt || Timestamp.now();
            }
            return { id: doc.id, ...data } as Group;
        });

        console.log('[groupService] Parsed groups data:', groups);
        onUpdate(groups);
      },
      (error) => {
        console.error("[groupService] onSnapshot listener failed:", error);
        onError(error);
      }
    );

    return unsubscribe;
};


// ====================================================================================
// ALTERNATIVE IMPLEMENTATION (Client-Side Sorting)
// ====================================================================================
// If you cannot or do not want to create the Firestore index, you can use this function.
// It removes the `orderBy` from the query and performs the sorting in your browser.
// This is slightly less efficient for large datasets but works without extra setup.
//
// To use this, rename it to `onUserGroupsSnapshot` and rename the original function.
// ====================================================================================
/*
export const onUserGroupsSnapshot_ClientSort = (
    userId: string,
    onUpdate: (groups: Group[]) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    console.log('[groupService-ClientSort] Subscribing to groups for user:', userId);

    const q = query(
        collection(db, GROUPS),
        where('members', 'array-contains', userId)
    );
    
    console.log('[groupService-ClientSort] Using query (no ordering):', q);

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        console.log(`[groupService-ClientSort] Snapshot updated. Found ${snapshot.docs.length} document(s).`);

        const groups = snapshot.docs.map(doc => {
            const data = doc.data();
            if (!data.lastActivity) {
                data.lastActivity = data.createdAt || Timestamp.now();
            }
            return { id: doc.id, ...data } as Group;
        });

        // Manual sorting on the client
        groups.sort((a, b) => {
            const timeA = a.lastActivity?.toMillis() || 0;
            const timeB = b.lastActivity?.toMillis() || 0;
            return timeB - timeA; // Descending order
        });

        console.log('[groupService-ClientSort] Parsed and sorted groups data:', groups);
        onUpdate(groups);
      },
      (error) => {
        console.error("[groupService-ClientSort] onSnapshot listener failed:", error);
        onError(error);
      }
    );
    return unsubscribe;
};
*/

// Get details for a single group by invite code
export const getGroupByInviteCode = async (inviteCode: string): Promise<Group | null> => {
    const q = query(collection(db, GROUPS), where('inviteCode', '==', inviteCode.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const groupDoc = snapshot.docs[0];
    return { id: groupDoc.id, ...groupDoc.data() } as Group;
};

// Get single group details by ID
export const getGroupById = async (groupId: string): Promise<Group | null> => {
    const groupRef = doc(db, GROUPS, groupId);
    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) return null;
    return { id: groupSnap.id, ...groupSnap.data() } as Group;
};


// Join a group via invite code
export const joinGroup = async (inviteCode: string, userId: string): Promise<Group> => {
    const group = await getGroupByInviteCode(inviteCode);
    if (!group) {
        throw new Error(mapGroupError('invalid-code'));
    }
    if (group.members.includes(userId)) {
        throw new Error(mapGroupError('already-member'));
    }

    const groupRef = doc(db, GROUPS, group.id);
    const userRef = doc(db, USERS, userId);

    const batch = writeBatch(db);
    batch.update(groupRef, { members: arrayUnion(userId) });
    batch.update(userRef, { groupIds: arrayUnion(group.id) });
    await batch.commit();
    
    return { ...group, members: [...group.members, userId]};
};


// Leave a group
export const leaveGroup = async (groupId: string, userId: string): Promise<void> => {
  const groupRef = doc(db, GROUPS, groupId);
  const userRef = doc(db, USERS, userId);

  await runTransaction(db, async (transaction) => {
    const groupDoc = await transaction.get(groupRef);
    if (!groupDoc.exists()) {
      throw new Error(mapGroupError('not-found'));
    }
    const group = groupDoc.data() as Group;

    if (group.members.length === 1 && group.members[0] === userId) {
      transaction.delete(groupRef);
    } else {
      let updateData: any = {
        members: arrayRemove(userId)
      };
      if (group.createdBy === userId) {
        updateData.createdBy = group.members.find(id => id !== userId);
      }
      transaction.update(groupRef, updateData);
    }
    transaction.update(userRef, { groupIds: arrayRemove(groupId) });
  });
};

// Delete a group (creator only)
export const deleteGroup = async (groupId: string, userId: string): Promise<void> => {
    const groupRef = doc(db, GROUPS, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) throw new Error(mapGroupError('not-found'));

    const group = groupSnap.data() as Group;
    if (group.createdBy !== userId) throw new Error(mapGroupError('permission-denied'));

    const batch = writeBatch(db);

    for (const memberId of group.members) {
        const userRef = doc(db, USERS, memberId);
        batch.update(userRef, { groupIds: arrayRemove(groupId) });
    }
    batch.delete(groupRef);

    await batch.commit();
};

// Update group activity timestamp
export const updateGroupActivity = async (groupId: string) => {
    const groupRef = doc(db, GROUPS, groupId);
    await updateDoc(groupRef, { lastActivity: serverTimestamp() });
};
