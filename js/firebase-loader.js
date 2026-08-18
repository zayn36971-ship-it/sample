// ============================================================
// Firebase Loader — loads Firebase and exposes globally
// Include this as <script type="module"> BEFORE script.js
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

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

// Expose Firestore helpers globally so non-module scripts (script.js) can use them
window.firebaseDB = db;
window.firebaseHelpers = {
    collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
    query, where, orderBy, limit, serverTimestamp
};
window.firebaseReady = true;

// Dispatch event so script.js knows Firebase is loaded
window.dispatchEvent(new Event('firebase-ready'));
