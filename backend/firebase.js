// backend/firebase.js - Centralized Firebase Configuration
/* istanbul ignore file */
const admin = require('firebase-admin');

console.log('🔍 Loading Firebase configuration...');

// Check if Firebase is already initialized
if (admin.apps.length === 0) {
  try {
    console.log('🔧 Initializing Firebase Admin SDK...');
    
    // Try service account key from environment variable first (your preferred method)
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const fs = require('fs');
      const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      
      if (fs.existsSync(keyPath)) {
        const serviceAccount = require(keyPath);
        
        if (serviceAccount.private_key && serviceAccount.client_email && serviceAccount.project_id) {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          
          console.log('✅ Firebase Admin initialized with environment variable path');
        } else {
          throw new Error('Invalid service account key structure');
        }
      } else {
        throw new Error('Service account key file not found at specified path');
      }
    }
    // Fallback to direct service account key file
    else {
      try {
        const serviceAccount = require('./serviceAccountKey.json');
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          // Update with your project ID if needed
          databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
        });
        
        console.log('✅ Firebase Admin initialized with direct service account key');
        
      } catch (keyError) {
        // Last resort: environment variables
        if (process.env.FIREBASE_PROJECT_ID && 
            process.env.FIREBASE_PRIVATE_KEY && 
            process.env.FIREBASE_CLIENT_EMAIL) {
          
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            }),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
          });
          
          console.log('✅ Firebase Admin initialized with individual environment variables');
        } else {
          throw new Error('No valid Firebase configuration found');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    console.error('   Please ensure you have one of the following:');
    console.error('   1. GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to service account key');
    console.error('   2. serviceAccountKey.json file in the backend folder');
    console.error('   3. Individual Firebase environment variables');
    throw error;
  }
} else {
  console.log(`✅ Firebase Admin already initialized (${admin.apps.length} app(s) exist)`);
}

// Get Firestore database
const db = admin.firestore();

// Test the connection
async function testFirestoreConnection() {
  try {
    await db.collection('connection-test').doc('test').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'connected'
    });
    console.log('✅ Firestore connection test successful');
    
    // Clean up test document
    await db.collection('connection-test').doc('test').delete();
    
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error.message);
    throw error;
  }
}

// Export everything
module.exports = { 
  admin, 
  db,
  testFirestoreConnection
};
