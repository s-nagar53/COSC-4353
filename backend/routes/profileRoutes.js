const { db } = require('../firebase');
const express = require('express');
const router = express.Router();
//const { profiles } = require('../data/memoryStore');
const { validateProfile } = require('../utils/validateProfile');

// Save profile (create or update)
// Save or update profile in Firestore
router.post('/', async (req, res) => {
  const { uid, role, ...data } = req.body;

  if (!uid || !role) {
    return res.status(400).json({ message: 'Missing UID or role' });
  }

  const errors = validateProfile({ uid, ...data }, role);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation errors', errors });
  }

  const profileData = { uid, role, ...data };

  try {
    await db.collection('users').doc(uid).set(profileData, { merge: true });
    res.status(200).json({ message: 'Profile saved to Firestore' });
  } catch (err) {
    res.status(500).json({ message: 'Firestore error', error: err.message });
  }
});


// Add history to volunteer
// Add event history to user profile in Firestore
router.post('/:uid/history', async (req, res) => {
  const { uid } = req.params;
  const newHistory = req.body;

  try {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentData = doc.data();
    const updatedHistory = [...(currentData.history || []), newHistory];

    await userRef.update({ history: updatedHistory });

    res.status(200).json({ message: 'History added', history: updatedHistory });
  } catch (err) {
    res.status(500).json({ message: 'Firestore error', error: err.message });
  }
});


// Get all volunteer profiles with history
router.get('/volunteer-history', async (req, res) => {
  try {
    const snapshot = await db.collection('users').where('role', '==', 'volunteer').get();

    const volunteers = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        name: data.name,
        email: data.email || '',
        skills: data.skills || [],
        totalEvents: data.history?.length || 0,
        history: data.history || []
      };
    });

    res.status(200).json(volunteers);
  }
  catch (err) {
    res.status(500).json({ message: 'Firestore error', error: err.message });
  }
});



// Get profile by UID from Firestore
router.get('/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) return res.status(404).json({ message: 'Profile not found' });

    res.status(200).json(doc.data());
  }
  catch (err) {
    res.status(500).json({ message: 'Firestore error', error: err.message });
  }
});


module.exports = router;

