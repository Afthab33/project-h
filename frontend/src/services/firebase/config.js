/* Initializes the Firebase app with your config
Sets up the authentication service
Exports the auth object to be used throughout your app */

//Firebase setup
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase if it's not already initialized
let firebaseApp;
if (!firebase.apps.length) {
  firebaseApp = firebase.initializeApp(firebaseConfig);
} else {
  firebaseApp = firebase.app();
}

const auth = firebase.auth();
const db = firebase.firestore();

// Facebook Auth Provider
const facebookProvider = new firebase.auth.FacebookAuthProvider();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Export everything we'll need
export {
  firebase,  // Export firebase itself
  firebaseApp,
  auth,
  db,
  googleProvider,
  facebookProvider
};

export default { firebase, firebaseApp, auth, db };