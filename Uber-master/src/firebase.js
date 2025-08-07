import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAmqQtTgvPSSzTGvO3kxhGcF7rqlZl4_L0",
  authDomain: "uber-rio-pardo.firebaseapp.com",
  projectId: "uber-rio-pardo",
  storageBucket: "uber-rio-pardo.firebasestorage.app",
  messagingSenderId: "128009984359",
  appId: "1:128009984359:web:ed2c6eee709ec47431f7c2",
  measurementId: "G-GGGEL6398M"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

