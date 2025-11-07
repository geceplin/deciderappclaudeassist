import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: Timestamp;
  groupIds?: string[];
}

export interface Group {
    id: string;
    name:string;
    createdBy: string;
    createdAt: Timestamp;
    members: string[];
    inviteCode: string;
    color: string;
    movieCount: number;
    lastActivity: Timestamp;
}

export type Opinion = 'must-watch' | 'already-seen' | 'pass';

export interface Movie {
  id: string; // Firestore document ID
  tmdbId: number; // The Movie Database ID
  title: string;
  year: number;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  genres: string[];
  rating: number;

  addedBy: string; // userId
  addedByName: string;
  addedAt: Timestamp;

  // Each user's opinion on the movie.
  // Guaranteed to exist, defaults to {}
  opinions: {
    [userId: string]: Opinion;
  };
  
  // Denormalized counts for quick filtering.
  // Guaranteed to exist, defaults to { mustWatch: 0, ... }
  opinionCounts: {
    mustWatch: number;
    alreadySeen: number;
    pass: number;
  };

  // Group decision tracking
  watchedTogether: boolean; // Guaranteed to exist, defaults to false
  watchedTogetherDate: Timestamp | null;
  groupRating: number | null;
}

export interface MovieSearchResult {
  tmdbId: number;
  title: string;
  year: number;
  overview: string;
  posterPath: string | null;
  rating: number;
}

// Full details fetched when adding a movie
export interface MovieDetails extends MovieSearchResult {
    backdropPath: string | null;
    genres: string[];
}

export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<FirebaseUser>;
  signIn: (email: string, password: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
}