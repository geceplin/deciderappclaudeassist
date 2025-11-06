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

export interface Movie {
  id: string;
  title: string;
  year: number;
  overview: string;
  posterPath: string;
  addedBy: string; // userId
  addedAt: Timestamp;
  likes: string[]; // array of userIds
}

export interface MovieSearchResult {
  title: string;
  year: number;
  overview: string;
  posterPath: string;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<FirebaseUser>;
  signIn: (email: string, password: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
}