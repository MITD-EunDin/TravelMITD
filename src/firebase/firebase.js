import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDgA4fpQUbL3ExOtyEYAarbB3NAByx9Kc0",
    authDomain: "reviewtour-c9b93.firebaseapp.com",
    projectId: "reviewtour-c9b93",
    storageBucket: "reviewtour-c9b93.firebasestorage.app",
    messagingSenderId: "428156256607",
    appId: "1:428156256607:web:7c26e1e15004f9416a76ea",
    measurementId: "G-Y5STN8G9Y7"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const idToken = await user.getIdToken();
        console.log("idToken:", idToken);
        return { user, idToken };
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        throw error;
    }
};

export const sendPasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log("Password reset email sent to:", email);
    } catch (error) {
        console.error("Password reset error:", error.code, error.message);
        throw error;
    }
};

export { auth };