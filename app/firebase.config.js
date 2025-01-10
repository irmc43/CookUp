// firebase.config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB1e1pi0ogicETqB0BNFfLSGzWHFK8V2l4",
  authDomain: "cookup-bf3d9.firebaseapp.com",
  databaseURL: "https://cookup-bf3d9-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cookup-bf3d9",
  storageBucket: "cookup-bf3d9.firebasestorage.app",
  messagingSenderId: "435748210401",
  appId: "1:435748210401:web:8a0907cab10f536926d9a0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // Realtime Database
const firestore = getFirestore(app); // Firestore
const storage = getStorage(app); // Storage



export { app, db, firestore, storage };

export default { app, db, firestore, storage };