// ============================================================
// Firebase Auth Guard — Include on all admin pages
// Redirects to login if not authenticated
// ============================================================
import { auth, onAuthStateChanged } from './firebase-config.js';

let currentUser = null;

export function initAuthGuard() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUser = user;
                // Show the page content
                document.body.classList.add('authenticated');
                resolve(user);
            } else {
                // Not logged in — redirect to login
                window.location.href = '/admin/login.html';
                reject(new Error('Not authenticated'));
            }
        });
    });
}

export function getCurrentUser() {
    return currentUser;
}
