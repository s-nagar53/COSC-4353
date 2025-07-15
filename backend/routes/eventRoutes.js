const express = require('express');
const router = express.Router();
const { events } = require('../data/memoryEvents');
const { validateEvent } = require('../utils/validateEvent');

// Save event
router.post('/', (req, res) => {
  const { uid, role, ...data } = req.body;

  if (!uid) {
    return res.status(400).json({ message: 'Missing UID' });
  }

  const errors = validateEvent({ uid, ...data }, role);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation errors', errors });
  }

  const newEvent = { uid, role, ...data };

  events.event = events.event.filter(p => p.uid !== uid);
  events.event.push(newEvent);

  res.status(200).json({ message: 'Event saved successfully' });
});

// Get event
router.get('/:uid', (req, res) => {
  const uid = req.params.uid;

  const event =
    events.event.find(p => p.uid === uid);

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  res.json(event);
});

module.exports = router;
