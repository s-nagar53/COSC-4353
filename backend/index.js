require('dotenv').config(); // Load variables from .env
const express = require('express');
const cors = require('cors');
// const { profiles } = require('./data/memoryStore');
// const { events } = require('./data/memoryEvents');

console.log('🔧 Starting backend...');

// Import Firebase from your centralized firebase.js file
// This will handle all Firebase initialization
let admin, db, firebaseAdminInitialized;

try {
  const firebase = require('./firebase');
  admin = firebase.admin;
  db = firebase.db;
  firebaseAdminInitialized = true;
  console.log('✅ Firebase imported from firebase.js');
} catch (error) {
  console.error('⚠️ Could not load Firebase:', error.message);
  console.log('⚠️ Continuing without Firebase Admin...');
  firebaseAdminInitialized = false;
}

const app = express();

// Middleware - Move CORS before routes
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);

const eventRoutes = require('./routes/eventRoutes');
app.use('/api/event', eventRoutes);

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

const volunteerMatchingRoutes = require('./routes/volunteerMatchingRoutes');
app.use('/api/matching', volunteerMatchingRoutes);

const statesRoutes = require('./routes/statesRoutes');
app.use('/api/states', statesRoutes);

// Test route to verify backend is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is running!', 
    firebaseAdmin: firebaseAdminInitialized,
    // profiles: profiles ? Object.keys(profiles).length : 0,
    // events: events && events.event ? events.event.length : 0
  });
});

// Route to check matching data (for debugging)
app.get('/api/matching-data', (req, res) => {
  // Uncomment when you have these data sources
  res.json({
    message: 'Matching data endpoint',
    firebaseConnected: firebaseAdminInitialized
    // volunteers: profiles.volunteers.map(v => ({
    //   id: v.uid,
    //   name: v.name,
    //   city: v.city,
    //   skills: v.skills
    // })),
    // events: events.event.map(e => ({
    //   id: e.eid,
    //   name: e.eventname,
    //   city: e.city,
    //   skills: e.skills
    // }))
  });
});

// Assign role
app.post('/set-role', async (req, res) => {
  console.log('🔥 /set-role HIT');

  if (!firebaseAdminInitialized || !admin) {
    return res.status(503).json({ 
      message: 'Firebase Admin not available - service account key needed' 
    });
  }

  const idToken = req.headers.authorization?.split('Bearer ')[1];
  const { role } = req.body;

  if (!idToken || !role) {
    console.error('⚠️ Missing ID token or role');
    return res.status(400).json({ message: 'Missing ID token or role' });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    console.log('🧾 Assigning role:', role, 'for UID:', uid);

    await admin.auth().setCustomUserClaims(uid, { role });

    console.log(`✅ Role "${role}" assigned to UID: ${uid}`);
    res.json({ message: `Role "${role}" assigned to UID: ${uid}` });
  } catch (err) {
    console.error('❌ Error assigning role:', err);
    res.status(403).json({ message: 'Forbidden: ' + err.message });
  }
});

const PORT = 3001;

// Only start the server if NOT in test mode
/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}

// Export app for testing
module.exports = app;