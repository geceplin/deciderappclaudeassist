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
import { GoogleGenAI, Type } from "@google/genai";
import { db } from './firebase';
import { Movie, MovieSearchResult } from '../types';

const GROUPS = 'groups';
const MOVIES = 'movies';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const movieSearchSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: 'The full title of the movie.' },
            year: { type: Type.NUMBER, description: 'The release year of the movie.' },
            overview: { type: Type.STRING, description: 'A brief, one-paragraph summary of the movie.' },
            posterPath: { type: Type.STRING, description: 'The poster path from TMDb, e.g., "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg". Should not be null or empty.' },
        },
        required: ["title", "year", "overview", "posterPath"],
    },
};

export const searchMovies = async (searchQuery: string): Promise<MovieSearchResult[]> => {
    try {
        const prompt = `Search for movies matching "${searchQuery}". Provide a list of up to 6 relevant results. For each movie, include its title, release year, a brief overview, and its poster path from themoviedb.org (TMDb). Ensure the poster path is just the path string, not the full URL.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: movieSearchSchema,
            },
        });

        const jsonString = response.text;
        const movies = JSON.parse(jsonString);
        // Filter out any results that Gemini might have returned with a null/empty poster path
        return movies.filter((m: any) => m.posterPath && m.posterPath.trim() !== ''); 
    } catch (error) {
        console.error("Error searching movies with Gemini:", error);
        throw new Error("Failed to search for movies. The model may be unavailable.");
    }
};

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
