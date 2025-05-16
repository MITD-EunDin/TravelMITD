import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDgA4fpQUbL3ExOtyEYAarbB3NAByx9Kc0",
    authDomain: "reviewtour-c9b93.firebaseapp.com",
    projectId: "reviewtour-c9b93",
    storageBucket: "reviewtour-c9b93.firebasestorage.app",
    messagingSenderId: "428156256607",
    appId: "1:428156256607:web:1a8cedadc3106e046a76ea",
    measurementId: "G-QVHVPYC76P"
};

// Khởi tạo Firebase App chỉ khi chưa có ứng dụng nào tồn tại
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
console.log("Firebase initialized successfully:", app);

// Khởi tạo Firestore
export const db = getFirestore(app);