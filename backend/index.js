
console.log('🔧 Starting backend...');

const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();


// Load service account key
try {
  const serviceAccount = require('./serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

} catch (err) {
  console.error('❌ Error loading service account:', err);
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());


// Assign role
app.post('/set-role', async (req, res) => {
  console.log('🔥 /set-role HIT');

  const idToken = req.headers.authorization?.split('Bearer ')[1];
  const { role } = req.body;

  if (!idToken || !role) {
    console.error('⚠️ Missing ID token or role');
    return res.status(400).send('Missing ID token or role');
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;

    console.log('🧾 Assigning role:', role, 'for UID:', uid);

    await admin.auth().setCustomUserClaims(uid, { role });

    console.log(`✅ Role "${role}" assigned to UID: ${uid}`);
    res.send(`Role "${role}" assigned to UID: ${uid}`);
  } catch (err) {
    console.error('❌ Error assigning role:', err);
    res.status(403).send('Forbidden: ' + err.message);
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
