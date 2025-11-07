import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
  onSnapshot,
  Unsubscribe,
  query,
  where,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Movie, Opinion, MovieDetails } from '../types';
import * as tmdbService from './tmdbService';

const GROUPS = 'groups';
const MOVIES = 'movies';

/**
 * Calculates the counts of each opinion type from an opinions map.
 * This function is null-safe and returns zero for all counts if opinions are missing.
 * @param opinions A map of user IDs to their opinion.
 * @returns An object with counts for mustWatch, alreadySeen, and pass.
 */
const calculateOpinionCounts = (opinions: Record<string, Opinion> = {}) => {
  const values = Object.values(opinions);
  return {
    mustWatch: values.filter(o => o === 'must-watch').length,
    alreadySeen: values.filter(o => o === 'already-seen').length,
    pass: values.filter(o => o === 'pass').length,
  };
};

/**
 * Subscribes to real-time updates for movies within a specific group.
 * Provides default values for any missing opinion-related fields to prevent UI errors.
 */
export const onGroupMoviesSnapshot = (
    groupId: string,
    onUpdate: (movies: Movie[]) => void,
    onError: (error: Error) => void
): Unsubscribe => {
    const q = query(collection(db, GROUPS, groupId, MOVIES));
    
    return onSnapshot(q, (snapshot) => {
        const movies = snapshot.docs.map(doc => {
            const data = doc.data();
            // Ensure data integrity for the frontend, providing defaults if fields are missing.
            return {
                id: doc.id,
                opinions: {},
                opinionCounts: { mustWatch: 0, alreadySeen: 0, pass: 0 },
                watchedTogether: false,
                ...data,
            } as Movie;
        });
        onUpdate(movies);
    }, onError);
};

/**
 * Adds a new movie to a group, fetching its full details from TMDb first.
 * Initializes all required fields with safe defaults to ensure data integrity.
 */
export const addMovieToGroup = async (groupId: string, movie: MovieDetails, userId: string, userName: string): Promise<void> => {
    const groupRef = doc(db, GROUPS, groupId);
    const moviesColRef = collection(groupRef, MOVIES);
    const newMovieRef = doc(moviesColRef); // Create a reference to get the ID

    await runTransaction(db, async (transaction) => {
        const groupDoc = await transaction.get(groupRef);
        if (!groupDoc.exists()) throw new Error("Group not found.");
        
        // Prepare a complete and safe movie object for Firestore
        const movieToAdd: Omit<Movie, 'id'> = {
            tmdbId: movie.tmdbId,
            title: movie.title,
            year: movie.year,
            overview: movie.overview,
            posterPath: movie.posterPath,
            backdropPath: movie.backdropPath,
            genres: movie.genres,
            rating: movie.rating,
            addedBy: userId,
            addedByName: userName,
            addedAt: serverTimestamp() as any, // Cast to any to satisfy type temporarily
            opinions: { [userId]: 'must-watch' }, // Default creator's opinion
            opinionCounts: { mustWatch: 1, alreadySeen: 0, pass: 0 },
            watchedTogether: false,
            watchedTogetherDate: null,
            groupRating: null,
        };

        transaction.set(newMovieRef, movieToAdd);
        
        const newCount = (groupDoc.data().movieCount || 0) + 1;
        transaction.update(groupRef, { 
            movieCount: newCount,
            lastActivity: serverTimestamp() 
        });
    });
};

/**
 * Sets or removes a user's opinion on a movie and updates the aggregated counts.
 */
export const setMovieOpinion = async (groupId: string, movieId: string, userId: string, opinion: Opinion | null): Promise<void> => {
    const movieRef = doc(db, GROUPS, groupId, MOVIES, movieId);
    
    await runTransaction(db, async (transaction) => {
        const movieDoc = await transaction.get(movieRef);
        if (!movieDoc.exists()) throw new Error("Movie not found.");

        const movieData = movieDoc.data();
        const currentOpinions = movieData.opinions || {};
        
        if (opinion) {
            currentOpinions[userId] = opinion;
        } else {
            delete currentOpinions[userId];
        }

        const newCounts = calculateOpinionCounts(currentOpinions);

        transaction.update(movieRef, {
            opinions: currentOpinions,
            opinionCounts: newCounts
        });
    });
};

/**
 * Fetches all movies in a group that have not been marked as watched together.
 * This is used to populate the reel spinner.
 */
export const getUnwatchedMoviesForReel = async (groupId: string): Promise<Movie[]> => {
    const q = query(
        collection(db, GROUPS, groupId, MOVIES),
        where('watchedTogether', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        // Provide defaults to ensure type safety, even if data is malformed
        opinions: {}, 
        opinionCounts: { mustWatch: 0, alreadySeen: 0, pass: 0 },
        watchedTogether: false,
        ...doc.data()
    } as Movie));
};

/**
 * Marks a movie as "watched together" by the group.
 */
export const markWatchedTogether = async (groupId: string, movieId: string): Promise<void> => {
    const movieRef = doc(db, GROUPS, groupId, MOVIES, movieId);
    await updateDoc(movieRef, {
        watchedTogether: true,
        watchedTogetherDate: serverTimestamp(),
    });
};

/**
 * Removes a movie from a group's watchlist. Only the user who added it can remove it.
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