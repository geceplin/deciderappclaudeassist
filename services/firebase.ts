import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZzh7LZ0K3IxDR6Rdhii4SZkSTWDAux9E",
  authDomain: "decide-movie-night.firebaseapp.com",
  projectId: "decide-movie-night",
  storageBucket: "decide-movie-night.firebasestorage.app",
  messagingSenderId: "535034964969",
  appId: "1:535034964969:web:820c4b58e5c59d4c617978"
};

// Log the config to verify
console.log('Firebase Config Loaded:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Test Firebase connection
console.log('Firebase Auth:', auth ? '✅ Loaded' : '❌ Failed');
console.log('Firebase Firestore:', db ? '✅ Loaded' : '❌ Failed');