import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAPs1MUxE7wN0wD7NMnhPsge9kpZBCdRb0",
  authDomain: "nitionz-45567.firebaseapp.com",
  databaseURL: "https://nitionz-45567-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nitionz-45567",
  storageBucket: "nitionz-45567.firebasestorage.app",
  messagingSenderId: "934328588597",
  appId: "1:934328588597:web:3152530b5c228ea81dd47c",
  measurementId: "G-GHDN49GQ0J"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Analytics (only on client side)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;