import { doc, getDoc, getDocs, collection, query, where, documentId } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types';

const USERS = 'users';

export const getUsersByIds = async (userIds: string[]): Promise<Map<string, UserProfile>> => {
    const userMap = new Map<string, UserProfile>();
    if (userIds.length === 0) return userMap;

    // Firestore 'in' query is limited to 30 items, so we chunk the requests
    const chunks: string[][] = [];
    for (let i = 0; i < userIds.length; i += 30) {
        chunks.push(userIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
        if (chunk.length === 0) continue;
        const q = query(collection(db, USERS), where(documentId(), 'in', chunk));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            userMap.set(doc.id, { uid: doc.id, ...doc.data() } as UserProfile);
        });
    }
    
    return userMap;
};