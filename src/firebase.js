// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const firebaseConfig = {
    apiKey: "AIzaSyDuZuWmX2001EyyMFePtZQ0thXWJdCnuTE",
    authDomain: "cosc-4353-project-e65ec.firebaseapp.com",
    projectId: "cosc-4353-project-e65ec",
    storageBucket: "cosc-4353-project-e65ec.firebasestorage.app",
    messagingSenderId: "925707173861",
    appId: "1:925707173861:web:c6ab0abd7d482ea371390c"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase Authentication instance
const auth = getAuth(app);

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

export { auth };
