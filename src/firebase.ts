// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSJq547FmektzNdtq4cNBmYf16ECBng-8",
  authDomain: "secret-message-react.firebaseapp.com",
  projectId: "secret-message-react",
  storageBucket: "secret-message-react.appspot.com",
  messagingSenderId: "231649715039",
  appId: "1:231649715039:web:a93741cd863afccca00cea",
  measurementId: "G-S6MT6DY3G3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);