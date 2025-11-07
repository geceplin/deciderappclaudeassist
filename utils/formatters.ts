import { Timestamp } from 'firebase/firestore';

/**
 * Formats a Firestore Timestamp into a readable date string.
 * e.g., "Aug 2, 2024"
 * @param timestamp The Firestore Timestamp object.
 * @returns A formatted string, or an empty string if the timestamp is null.
 */
export const formatDate = (timestamp: Timestamp | null): string => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};