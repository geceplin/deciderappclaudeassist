
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { AuthContextType } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapFirebaseError = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use': return 'This email is already registered. Try signing in!';
    case 'auth/weak-password': return 'Password should be at least 8 characters.';
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/user-not-found': return 'No account found with this email. Want to sign up?';
    case 'auth/wrong-password': return 'Incorrect password. Please try again!';
    case 'auth/too-many-requests': return 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
    case 'auth/network-request-failed': return 'Connection lost. Check your internet and try again.';
    case 'auth/popup-closed-by-user': return 'The sign-in process was cancelled.';
    default: return 'An unexpected error occurred. Please try again.';
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const createUserProfile = async (user: FirebaseUser, displayName?: string) => {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: displayName || user.displayName,
        createdAt: serverTimestamp(),
        bio: '',
        language: 'en',
      });
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<FirebaseUser> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      await createUserProfile(userCredential.user, displayName);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(mapFirebaseError(error.code));
    }
  };

  const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(mapFirebaseError(error.code));
    }
  };
  
  const signInWithGoogle = async (): Promise<FirebaseUser> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
      return result.user;
    } catch (error: any) {
      throw new Error(mapFirebaseError(error.code));
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error("Failed to sign out. Please try again.");
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};