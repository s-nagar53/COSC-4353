// backend/firebase.js
const admin = require('firebase-admin');

// This assumes Firebase Admin is already initialized in index.js
const db = admin.firestore();

module.exports = { admin, db };
