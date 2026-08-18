// ============================================================
// Firebase Configuration — Shared across all pages
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp, onSnapshot, getCountFromServer } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyASc4NeSa5EjC3cD3AlfX0jYBANp0f5-Io",
    authDomain: "portfolio-dab96.firebaseapp.com",
    projectId: "portfolio-dab96",
    storageBucket: "portfolio-dab96.firebasestorage.app",
    messagingSenderId: "573008159687",
    appId: "1:573008159687:web:f96cbec7cac3fcee156fe2",
    measurementId: "G-XJ4QWMCW3M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export {
    app, db, auth,
    // Firestore helpers
    collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit, serverTimestamp, onSnapshot, getCountFromServer,
    // Auth helpers
    signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail
};
