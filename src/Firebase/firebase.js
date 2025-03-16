import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Firebase configuration - replace with your own
const firebaseConfig = {
  apiKey: "AIzaSyBJIkCc7RTuwvPgprbuWQSoF2IfMt7LdvY",
  authDomain: "chat-app-83fe8.firebaseapp.com",
  projectId: "chat-app-83fe8",
  storageBucket: "chat-app-83fe8.appspot.com",
  messagingSenderId: "607878062257",
  appId: "1:607878062257:web:6f35069e2725f8bc2f4290",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

export { app, auth, db, storage }

