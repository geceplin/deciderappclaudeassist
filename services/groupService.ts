
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
  // Ensure code is unique
  const groupQuery = query(collection(db, GROUPS), where('inviteCode', '==', code));
  const querySnapshot = await getDocs(groupQuery);
  if (!querySnapshot.empty) {
    return generateInviteCode(); // Recurse if code exists
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
    // Add groupId to the user's profile
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

// Get all groups a user is a member of (real-time)
export const onUserGroupsSnapshot = (userId: string, callback: (groups: Group[]) => void): Unsubscribe => {
    const q = query(
        collection(db, GROUPS), 
        where('members', 'array-contains', userId),
        orderBy('lastActivity', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
        const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
        callback(groups);
    });
};

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

    // If the user is the last member, delete the group
    if (group.members.length === 1 && group.members[0] === userId) {
      transaction.delete(groupRef);
    } else {
      let updateData: { members: string[], createdBy?: string } = {
        members: arrayRemove(userId)
      };
      // If the creator is leaving, transfer ownership to the next member
      if (group.createdBy === userId) {
        updateData.createdBy = group.members.find(id => id !== userId);
      }
      transaction.update(groupRef, updateData);
    }
    // Remove group from user's list
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

    // Remove group ID from all members
    for (const memberId of group.members) {
        const userRef = doc(db, USERS, memberId);
        batch.update(userRef, { groupIds: arrayRemove(groupId) });
    }

    // Delete the group itself
    batch.delete(groupRef);

    await batch.commit();
};

// Update group activity timestamp
export const updateGroupActivity = async (groupId: string) => {
    const groupRef = doc(db, GROUPS, groupId);
    await updateDoc(groupRef, { lastActivity: serverTimestamp() });
};
