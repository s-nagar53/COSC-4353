const express = require('express');
const router = express.Router();
const { profiles } = require('../data/memoryStore');
const { validateProfile } = require('../utils/validateProfile');

// Save profile (create or update)
router.post('/', (req, res) => {
  const { uid, ...data } = req.body;

  if (!uid) {
    return res.status(400).json({ message: 'Missing UID' });
  }

  const errors = validateProfile({ uid, ...data }, 'volunteer');
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation errors', errors });
  }

  const existingProfile = profiles.volunteers.find(p => p.uid === uid);
  const preservedHistory = existingProfile?.history || [];

  const newProfile = {
    uid,
    ...data,
    history: preservedHistory
  };

  profiles.volunteers = profiles.volunteers.filter(p => p.uid !== uid);
  profiles.volunteers.push(newProfile);

  res.status(200).json({ message: 'Profile saved successfully' });
});

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
  }

  volunteer.history.push(newHistoryEntry);

  res.status(200).json({ message: 'History added', history: volunteer.history });
});

// Get all volunteer profiles with their history
router.get('/volunteer-history', (req, res) => {
  const volunteerData = profiles.volunteers.map((v, i) => ({
    id: i + 1, // used in frontend table key
    uid: v.uid,
    name: v.name,
    email: v.email,
    skills: v.skills || [],
    totalEvents: v.history?.length || 0,
    history: v.history || []
  }));

  res.status(200).json(volunteerData);
});
// Get profile by UID
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
