require('dotenv').config(); // Load variables from .env
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const { profiles } = require('./data/memoryStore');
const { events } = require('./data/memoryEvents');
const volunteerMatchingRoutes = require('./routes/volunteerMatchingRoutes');

console.log('🔧 Starting backend...');

// Load service account key from path in .env
let firebaseAdminInitialized = false;

try {
  const fs = require('fs');
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (fs.existsSync(keyPath)) {
    const serviceAccount = require(keyPath);
    
    // Check if it's a valid service account
    if (serviceAccount.private_key && serviceAccount.client_email && serviceAccount.project_id) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      
      firebaseAdminInitialized = true;
      console.log('✅ Firebase Admin initialized');
    } else {
      console.log('⚠️ Invalid service account key. Continuing without Firebase Admin...');
    }
  } else {
    console.log('⚠️ Service account key file not found. Continuing without Firebase Admin...');
  }
} catch (err) {
  console.error('⚠️ Could not initialize Firebase Admin:', err.message);
  console.log('⚠️ Continuing without Firebase Admin...');
}

const app = express();

// Middleware
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

app.use('/api/matching', volunteerMatchingRoutes);

// Test route to verify backend is working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is running!', 
    firebaseAdmin: firebaseAdminInitialized,
    profiles: Object.keys(profiles).length,
    events: events.event ? events.event.length : 0
  });
});

// route to check matching data (for debugging)
app.get('/api/matching-data', (req, res) => {
  res.json({
    volunteers: profiles.volunteers.map(v => ({
      id: v.uid,
      name: v.name,
      city: v.city,
      skills: v.skills
    })),
    events: events.event.map(e => ({
      id: e.eid,
      name: e.eventname,
      city: e.city,
      skills: e.skills
    }))
  });
});

// Assign role
app.post('/set-role', async (req, res) => {
  console.log('🔥 /set-role HIT');

  if (!firebaseAdminInitialized) {
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

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Loaded ${Object.keys(profiles).reduce((total, key) => total + profiles[key].length, 0)} profiles`);
  console.log(`📅 Loaded ${events.event ? events.event.length : 0} events`);
  
  // Log sample event data to verify eid structure
  if (events.event && events.event.length > 0) {
    console.log(`📋 Sample event: ${events.event[0].eid || 'No eid found'}`);
  }
});