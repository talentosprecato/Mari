import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    GoogleAuthProvider, 
    FacebookAuthProvider, 
    signInWithPopup,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';

// IMPORTANT: Replace this with your own Firebase project configuration.
// You can find this in your Firebase project settings under "Project settings".
const firebaseConfig = {
  apiKey: "AIzaSyALbZgBBrCPFn_Dxwb_17YlCSmbZsrHDM0",
  authDomain: "veravox-ai-cv-editor-for-us.firebaseapp.com",
  projectId: "veravox-ai-cv-editor-for-us",
  storageBucket: "veravox-ai-cv-editor-for-us.firebasestorage.app",
  messagingSenderId: "976963259671",
  appId: "1:976963259671:web:ebe9c4ae2c68240e7d7b52",
  measurementId: "G-GHYLQWNW1B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const signInWithFacebook = () => signInWithPopup(auth, facebookProvider);
export const signUpWithEmail = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const logInWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);

// Listener for auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};