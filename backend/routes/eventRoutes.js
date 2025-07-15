const express = require('express');
const router = express.Router();
const { events } = require('../data/memoryEvents');
const { validateEvent } = require('../utils/validateEvent');

// Get all events (MUST come before /:eid)
router.get('/all', (req, res) => {
  try {
    console.log('📋 Fetching all events, found:', events.event.length);
    res.json({ events: events.event });
  } catch (error) {
    console.error('Error fetching all events:', error);
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// Save event
router.post('/', (req, res) => {
  const { eid, uid, role, ...data } = req.body;

  if (!eid) {
    return res.status(400).json({ message: 'Missing Event ID (eid)' });
  }

  const errors = validateEvent({ eid, uid, ...data }, role);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation errors', errors });
  }

  const newEvent = { eid, uid, role, ...data };

  events.event = events.event.filter(e => e.eid !== eid);
  events.event.push(newEvent);

  res.status(200).json({ message: 'Event saved successfully' });
});

// Get event by eid (MUST come after /all)
router.get('/:eid', (req, res) => {
  const eid = req.params.eid;
  console.log('📋 Looking for event with eid:', eid);

  const event = events.event.find(e => e.eid === eid);

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  res.json(event);
});

// Delete event
router.delete('/:eid', (req, res) => {
  const eid = req.params.eid;
  
  const initialLength = events.event.length;
  events.event = events.event.filter(e => e.eid !== eid);
  
  if (events.event.length < initialLength) {
    console.log('✅ Event deleted:', eid);
    res.json({ message: 'Event deleted successfully' });
  } else {
    console.log('❌ Event not found for deletion:', eid);
    res.status(404).json({ message: 'Event not found' });
  }
});

module.exports = router;
