import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
  runTransaction,
  onSnapshot,
  Unsubscribe,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';
import { Movie, Opinion, MovieDetails, Comment } from '../types';

const GROUPS = 'groups';
const MOVIES = 'movies';

/**
 * Calculates the counts of each opinion type from an opinions map.
 * This function is null-safe and returns zero for all counts if opinions are missing.
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
    const newMovieRef = doc(moviesColRef);

    await runTransaction(db, async (transaction) => {
        const groupDoc = await transaction.get(groupRef);
        if (!groupDoc.exists()) throw new Error("Group not found.");
        
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
            addedAt: serverTimestamp() as Timestamp,
            opinions: { [userId]: 'must-watch' },
            opinionCounts: { mustWatch: 1, alreadySeen: 0, pass: 0 },
            watchedTogether: false,
            watchedTogetherDate: null,
            watchedTogetherBy: '',
            groupRatings: {},
            averageGroupRating: null,
            comments: [],
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
 * Marks a movie as "watched together" by the group using a transaction for atomicity.
 * This prevents race conditions and ensures the group's activity is also updated.
 */
export const markMovieWatchedTogether = async (groupId: string, movieId: string, userId: string): Promise<void> => {
    const groupRef = doc(db, GROUPS, groupId);
    const movieRef = doc(db, GROUPS, groupId, MOVIES, movieId);

    await runTransaction(db, async (transaction) => {
        const movieDoc = await transaction.get(movieRef);
        if (!movieDoc.exists()) {
            throw new Error("Movie not found. It may have been removed.");
        }
        
        const movieData = movieDoc.data();
        if (movieData.watchedTogether) {
            console.warn(`Movie ${movieId} was already marked as watched. Race condition handled.`);
            return; // Gracefully exit if already marked
        }

        // Atomically update both the movie and the group
        transaction.update(movieRef, {
            watchedTogether: true,
            watchedTogetherDate: serverTimestamp(),
            watchedTogetherBy: userId,
        });
        transaction.update(groupRef, {
            lastActivity: serverTimestamp()
        });
    });
};

/**
 * Gets the watch history for a group (movies watched together).
 */
export const getWatchHistory = async (groupId: string): Promise<Movie[]> => {
    const moviesRef = collection(db, 'groups', groupId, 'movies');
    const q = query(
        moviesRef,
        where('watchedTogether', '==', true),
        orderBy('watchedTogetherDate', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));
};


/**
 * Submits a user's rating for a movie they watched together and updates the average.
 */
export const rateWatchedMovie = async (groupId: string, movieId: string, userId: string, rating: number): Promise<void> => {
    const movieRef = doc(db, 'groups', groupId, 'movies', movieId);
    
    await runTransaction(db, async (transaction) => {
        const movieDoc = await transaction.get(movieRef);
        if (!movieDoc.exists()) throw new Error("Movie not found.");
        
        const movieData = movieDoc.data() as Movie;
        const currentRatings = movieData.groupRatings || {};
        currentRatings[userId] = rating;

        const allRatings = Object.values(currentRatings);
        const average = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
        const roundedAverage = Math.round(average * 10) / 10;

        transaction.update(movieRef, {
            groupRatings: currentRatings,
            averageGroupRating: roundedAverage,
        });
    });
};

/**
 * Fetches all movies in a group that have not been marked as watched together.
 * Used to populate the reel spinner.
 */
export const getUnwatchedMoviesForReel = async (groupId: string): Promise<Movie[]> => {
    const q = query(
        collection(db, GROUPS, groupId, MOVIES),
        where('watchedTogether', '==', false)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        opinions: {}, 
        opinionCounts: { mustWatch: 0, alreadySeen: 0, pass: 0 },
        watchedTogether: false,
        ...doc.data()
    } as Movie));
};

/**
 * Removes a movie from a group's watchlist.
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

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

/**
 * Adds a new comment to a watched movie.
 */
export const addCommentToMovie = async (groupId: string, movieId: string, userId: string, text: string): Promise<Comment> => {
    const movieRef = doc(db, GROUPS, groupId, MOVIES, movieId);
    const newComment: Comment = {
        id: generateId(),
        userId,
        text: text.trim(),
        timestamp: Timestamp.now(),
    };
    await updateDoc(movieRef, {
        comments: arrayUnion(newComment)
    });
    return newComment;
};

/**
 * Deletes a user's comment from a movie.
 */
export const deleteCommentFromMovie = async (groupId: string, movieId: string, commentToDelete: Comment): Promise<void> => {
    const movieRef = doc(db, GROUPS, groupId, MOVIES, movieId);

    await runTransaction(db, async (transaction) => {
        const movieDoc = await transaction.get(movieRef);
        if (!movieDoc.exists()) {
            throw new Error("Movie not found.");
        }
        
        const movieData = movieDoc.data();
        const existingComments = (movieData.comments || []) as Comment[];
        
        const updatedComments = existingComments.filter(comment => comment.id !== commentToDelete.id);
        
        transaction.update(movieRef, { comments: updatedComments });
    });
};