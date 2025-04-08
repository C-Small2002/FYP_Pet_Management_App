// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCGiAcFKYOGKNtNLbFM9k8zT3tsT-p9-KM",
  authDomain: "zoomiesfyp.firebaseapp.com",
  projectId: "zoomiesfyp",
  storageBucket: "zoomiesfyp.firebasestorage.app",
  messagingSenderId: "197426036461",
  appId: "1:197426036461:web:825e67873fcd03821896e4",
  measurementId: "G-SQERRHSW1Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export {db, analytics, auth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword};