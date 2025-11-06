import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  runTransaction,
  onSnapshot,
  Unsubscribe,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { Movie, MovieSearchResult } from '../types';
import * as tmdbService from './tmdbService';

const GROUPS = 'groups';
const MOVIES = 'movies';

/**
 * Searches for movies using the TMDb service and returns them in the format expected by the app.
 * @param searchQuery The user's search query.
 * @returns A promise that resolves to an array of movie search results.
 */
export const searchMovies = async (searchQuery: string): Promise<MovieSearchResult[]> => {
    try {
        const response = await tmdbService.searchMovies(searchQuery);
        return response.results;
    } catch (error) {
        console.error("Error searching movies via tmdbService:", error);
        // Propagate a user-friendly error message
        throw new Error("Failed to search for movies. The movie database might be temporarily unavailable.");
    }
};

/**
 * Subscribes to real-time updates for movies within a specific group.
 * @param groupId The ID of the group.
 * @param onUpdate Callback function to handle the updated list of movies.
 * @param onError Callback function to handle errors.
 * @returns An unsubscribe function to detach the listener.
 */
export const onGroupMoviesSnapshot = (
    groupId: string,
    onUpdate: (movies: Movie[]) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    const q = query(collection(db, GROUPS, groupId, MOVIES), orderBy('addedAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
        const movies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));
        onUpdate(movies);
    }, onError);
};

/**
 * Adds a new movie suggestion to a group's watchlist.
 * @param groupId The ID of the group.
 * @param movie The movie data to add.
 * @param userId The ID of the user adding the movie.
 */
export const addMovieToGroup = async (groupId: string, movie: MovieSearchResult, userId: string): Promise<void> => {
    const groupRef = doc(db, GROUPS, groupId);
    const moviesColRef = collection(groupRef, MOVIES);

    await runTransaction(db, async (transaction) => {
        const groupDoc = await transaction.get(groupRef);
        if (!groupDoc.exists()) {
            throw new Error("Group not found.");
        }
        
        transaction.set(doc(moviesColRef), {
            ...movie,
            addedBy: userId,
            addedAt: serverTimestamp(),
            likes: [],
        });
        
        const newCount = (groupDoc.data().movieCount || 0) + 1;
        transaction.update(groupRef, { 
            movieCount: newCount,
            lastActivity: serverTimestamp() 
        });
    });
};

/**
 * Toggles a user's "like" on a movie.
 * @param groupId The ID of the group containing the movie.
 * @param movieId The ID of the movie to like/unlike.
 * @param userId The ID of the user performing the action.
 */
export const toggleMovieLike = async (groupId: string, movieId: string, userId: string): Promise<void> => {
    const movieRef = doc(db, GROUPS, groupId, MOVIES, movieId);
    const movieDoc = await getDoc(movieRef);
    if (!movieDoc.exists()) {
        throw new Error("Movie not found.");
    }
    const movieData = movieDoc.data();
    if (movieData.likes.includes(userId)) {
        await updateDoc(movieRef, { likes: arrayRemove(userId) });
    } else {
        await updateDoc(movieRef, { likes: arrayUnion(userId) });
    }
};

/**
 * Removes a movie from a group's watchlist.
 * @param groupId The ID of the group.
 * @param movieId The ID of the movie to remove.
 * @param userId The ID of the user performing the action (must be the one who added it).
 */
export const removeMovieFromGroup = async (groupId: string, movieId: string, userId: string): Promise<void> => {
    const groupRef = doc(db, GROUPS, groupId);
    const movieRef = doc(db, GROUPS, groupId, MOVIES, movieId);

     await runTransaction(db, async (transaction) => {
        const groupDoc = await transaction.get(groupRef);
        const movieDoc = await transaction.get(movieRef);

        if (!groupDoc.exists()) throw new Error("Group not found.");
        if (!movieDoc.exists()) throw new Error("Movie not found.");

        const movieData = movieDoc.data();
        if (movieData.addedBy !== userId) {
            throw new Error("You can only remove movies you added.");
        }

        transaction.delete(movieRef);
        
        const newCount = Math.max(0, (groupDoc.data().movieCount || 1) - 1);
        transaction.update(groupRef, { 
            movieCount: newCount,
            lastActivity: serverTimestamp() 
        });
    });
};
