import React, { createContext, useState, useEffect, useContext } from 'react';

// Mock User Type
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  providerData: {
    providerId: string;
    uid: string;
    displayName: string | null;
    email: string | null;
    phoneNumber: string | null;
    photoURL: string | null;
  }[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string, name: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  sendPasswordResetLink: (email: string) => Promise<void>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  sendPasswordResetLink: async () => {},
  changeUserPassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for a mock session
    const storedUser = localStorage.getItem('decide_mock_user');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Create a default mock user for immediate usage
      const mockUser: User = {
        uid: 'mock-user-123',
        email: 'demo@example.com',
        displayName: 'Demo User',
        providerData: [],
      };
      setUser(mockUser);
      localStorage.setItem('decide_mock_user', JSON.stringify(mockUser));
    }
    
    setLoading(false);
  }, []);

  const signOut = async () => {
    localStorage.removeItem('decide_mock_user');
    setUser(null);
    // Reload to reset the auto-login logic above for demo purposes
    window.location.reload(); 
  };

  const signIn = async (email: string, pass: string) => console.log('Mock signIn');
  const signUp = async (email: string, pass: string, name: string) => console.log('Mock signUp');
  const signInWithGoogle = async () => console.log('Mock signInWithGoogle');
  const sendPasswordResetLink = async (email: string) => console.log('Mock sendPasswordResetLink');
  const changeUserPassword = async (current: string, newPass: string) => console.log('Mock changeUserPassword');

  const value = {
    user,
    loading,
    signOut,
    signIn,
    signUp,
    signInWithGoogle,
    sendPasswordResetLink,
    changeUserPassword,
  };

  return React.createElement(AuthContext.Provider, { value }, !loading && children);
};