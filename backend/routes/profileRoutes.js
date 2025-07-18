
/*const express = require('express');
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
*/
const express = require('express');
const router = express.Router();
const { profiles } = require('../data/memoryStore');
const { validateProfile } = require('../utils/validateProfile');

// Save profile (create or update)
router.post('/', (req, res) => {
  const { uid, role, ...data } = req.body;

  if (!uid || !role) {
    return res.status(400).json({ message: 'Missing UID or role' });
  }

  const errors = validateProfile({ uid, ...data }, role);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation errors', errors });
  }

  if (role === 'admin') {
    profiles.admins = profiles.admins.filter(p => p.uid !== uid);
    profiles.admins.push({ uid, role, ...data });
  } else {
    const existingProfile = profiles.volunteers.find(p => p.uid === uid);
    const preservedHistory = existingProfile?.history || [];

    const newProfile = {
      uid,
      role,
      ...data,
      history: preservedHistory
    };

    profiles.volunteers = profiles.volunteers.filter(p => p.uid !== uid);
    profiles.volunteers.push(newProfile);
  }

  res.status(200).json({ message: 'Profile saved successfully' });
});

// Add history to volunteer
router.post('/:uid/history', (req, res) => {
  const { uid } = req.params;
  const {
    eid,
    eventname,
    address,
    city,
    state,
    zip,
    skills,
    requiredSkills,
    urgency,
    availability
  } = req.body;

  const volunteer = profiles.volunteers.find(v => v.uid === uid);
  if (!volunteer) {
    return res.status(404).json({ message: 'Volunteer not found' });
  }

  if (!volunteer.history) volunteer.history = [];

  const newHistoryEntry = {
    eid,
    eventname,
    address,
    city,
    state,
    zip,
    skills,
    requiredSkills,
    urgency,
    availability
  };

  volunteer.history.push(newHistoryEntry);

  res.status(200).json({ message: 'History added', history: volunteer.history });
});

// Get all volunteers with history
router.get('/volunteer-history', (req, res) => {
  const volunteerData = profiles.volunteers.map((v, i) => ({
    id: i + 1,
    uid: v.uid,
    name: v.name,
    email: v.email,
    skills: v.skills || [],
    totalEvents: v.history?.length || 0,
    history: v.history || []
  }));

  res.status(200).json(volunteerData);
});

// Get profile by UID (admin or volunteer)
router.get('/:uid', (req, res) => {
  const { uid } = req.params;

  const profile =
    profiles.admins.find(p => p.uid === uid) ||
    profiles.volunteers.find(p => p.uid === uid);

  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  res.json(profile);
});

module.exports = router;

