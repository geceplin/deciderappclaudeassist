import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp, increment } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt: Timestamp;
  groupIds?: string[];
  bio?: string;
  language?: 'en' | 'es';
}

export interface Group {
    id: string;
    name:string;
    createdBy: string;
    ownerId: string;
    createdAt: Timestamp;
    members: string[];
    inviteCode: string;
    color: string;
    movieCount: number;
    lastActivity: Timestamp;
}

export type Opinion = 'must-watch' | 'already-seen' | 'pass';

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: Timestamp;
}

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
  watchedTogetherBy?: string; // userId of who marked it as watched
  groupRatings?: { [userId: string]: number }; // Map of userId to rating (1-5)
  averageGroupRating?: number | null;
  comments?: Comment[];
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

// TMDb API specific types for movie details modal
export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
}

export interface Video {
  key: string;
  site: string;
  type: string;
  name: string;
  official: boolean;
}

export interface MoviePreview {
  tmdbId: number;
  title: string;
  year: number | null;
  rating: number;
  runtime: number | null;
  genres: string[];
  overview: string;
  cast: {
    name: string;
    character: string;
    profilePath: string | null;
  }[];
  posterPath: string | null;
  backdropPath: string | null;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<FirebaseUser>;
  signIn: (email: string, password: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
}