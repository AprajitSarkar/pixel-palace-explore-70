
// Firebase configuration
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA_SVxMXuPZMZIVh3dzGSuOzZN-Ia6psJc",
  authDomain: "hamsterkeygenerator.firebaseapp.com",
  databaseURL: "https://hamsterkeygenerator-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hamsterkeygenerator",
  storageBucket: "hamsterkeygenerator.appspot.com",
  messagingSenderId: "791565134228",
  appId: "1:791565134228:web:a8c62f31e253add4150781",
  measurementId: "G-7HQPV2Q12L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider, analytics };
