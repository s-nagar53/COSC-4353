const express = require('express');
const router = express.Router();
const { profiles } = require('../data/memoryStore');
const { validateProfile } = require('../utils/validateProfile');

// Save profile
router.post('/', (req, res) => {
  const { uid, role, ...data } = req.body;

  if (!uid || !role) {
    return res.status(400).json({ message: 'Missing UID or role' });
  }

  const errors = validateProfile({ uid, ...data }, role);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation errors', errors });
  }

  const newProfile = { uid, role, ...data };

  if (role === 'admin') {
    profiles.admins = profiles.admins.filter(p => p.uid !== uid);
    profiles.admins.push(newProfile);
  } else {
    profiles.volunteers = profiles.volunteers.filter(p => p.uid !== uid);
    profiles.volunteers.push(newProfile);
  }

  res.status(200).json({ message: 'Profile saved successfully' });
});

// Get profile
router.get('/:uid', (req, res) => {
  const uid = req.params.uid;

  const profile =
    profiles.admins.find(p => p.uid === uid) ||
    profiles.volunteers.find(p => p.uid === uid);

  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  res.json(profile);
});

module.exports = router;
