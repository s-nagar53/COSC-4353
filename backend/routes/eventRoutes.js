const express = require('express');
const router = express.Router();
const { db } = require('../firebase'); // Import Firestore
const { validateEvent } = require('../utils/validateEvent');
const notificationService = require('../utils/notificationService');

// Get all events (MUST come before /:eid)
router.get('/all', async (req, res) => {
  try {
    console.log('📋 Fetching all events from Firestore');
    
    const snapshot = await db.collection('events').get();
    const events = [];
    
    snapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('📋 Found events:', events.length);
    res.json({ events });
  } catch (error) {
    console.error('Error fetching all events:', error);
    /* istanbul ignore next */
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// Save event
router.post('/', async (req, res) => {
  try {
    const { eid, uid, role, ...data } = req.body;

    if (!eid) {
      return res.status(400).json({ message: 'Missing Event ID (eid)' });
    }

    const errors = validateEvent({ eid, uid, ...data }, role);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation errors', errors });
    }

    // 🔧 Normalize availability to YYYY-MM-DD
    const cleanedAvailability = (data.availability || []).map(date =>
      new Date(date).toISOString().split('T')[0]
    );

    const eventData = {
      eid,
      uid,
      role,
      ...data,
      id: eid, // Ensure events work with frontend
      availability: cleanedAvailability, // ✅ override with cleaned dates
      updatedAt: new Date(),
      createdAt: new Date() // Will be overwritten if document exists
    };

    // Use eid as document ID for consistent access
    const eventRef = db.collection('events').doc(eid);
    const existingEvent = await eventRef.get();
    
    if (existingEvent.exists) {
      // Update existing event (preserve createdAt)
      delete eventData.createdAt;
      await eventRef.update(eventData);
    } else {
      // Create new event
      await eventRef.set(eventData);
    }

    // Notify all matched volunteers for this event about the update
    const matchesSnapshot = await db.collection('matches')
      .where('eventId', '==', eid)
      .get();
    
    const notificationPromises = [];

matchesSnapshot.forEach(doc => {
  const matchData = doc.data();
  const volunteerId = matchData?.volunteerId;
  /* istanbul ignore if*/
  if (!volunteerId) {
    console.warn('⚠️ No volunteerId found in match:', matchData);
    return;
  }

  console.log(`📢 Sending update notification to volunteer ${volunteerId}`);
  notificationPromises.push(
    notificationService.sendNotification(volunteerId, {
      type: 'event_update', // or event_cancelled
      message: `Event '${eventData.eventname}' has been updated.`,
      data: {
        eventId: eventData.eid,
        eventName: eventData.eventname,
        date: eventData.availability?.[0] || 'TBD',
        city: eventData.city
      }
    }).catch(err => {
      console.error(`❌ Failed to send notification to volunteer ${volunteerId}:`, err);
    })
  );
});




    // Wait for all notifications to be sent (but don't block response)
    Promise.all(notificationPromises).catch(err => 
      /* istanbul ignore next */
      console.error('Error sending notifications:', err)
    );

    res.status(200).json({ message: 'Event saved successfully' });
  } catch (error) {
    /* istanbul ignore next */
    console.error('Error saving event:', error);
    /* istanbul ignore next */
    res.status(500).json({ message: 'Failed to save event' });
  }
});

// Get event by eid (MUST come after /all)
router.get('/:eid', async (req, res) => {
  try {
    const eid = req.params.eid;
    console.log('📋 Looking for event with eid:', eid);

    const doc = await db.collection('events').doc(eid).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = {
      id: doc.id,
      ...doc.data()
    };

    res.json(event);
  } catch (error) {
    /* istanbul ignore next */
    console.error('Error fetching event:', error);
    /* istanbul ignore next */
    res.status(500).json({ message: 'Failed to fetch event' });
  }
});

// Delete event
router.delete('/:eid', async (req, res) => {
  try {
    const eid = req.params.eid;
    
    const eventRef = db.collection('events').doc(eid);
    const eventDoc = await eventRef.get();
    
    if (!eventDoc.exists) {
      console.log('❌ Event not found for deletion:', eid);
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get event data before deletion for notifications
    const eventData = eventDoc.data();
    
    // Delete the event
    await eventRef.delete();
    
    console.log('✅ Event deleted:', eid);
    
    // Notify all matched volunteers for this event about the cancellation
    const matchesSnapshot = await db.collection('matches')
      .where('eventId', '==', eid)
      .get();

    const notificationPromises = [];

matchesSnapshot.forEach(doc => {
  const matchData = doc.data();
  const volunteerId = matchData?.volunteerId;

  if (!volunteerId) {
    console.warn('⚠️ Skipping match with missing volunteerId:', matchData);
    return;
  }

  console.log(`📢 Sending cancellation notification to volunteer ${volunteerId} for event ${eid}`);
  notificationPromises.push(
    notificationService.sendNotification(volunteerId, {
      type: 'event_cancelled',
      message: `Event '${eventData.eventname || eid}' has been cancelled or deleted.`,
      data: {
        eventId: eid,
        userId: volunteerId // ✅ This must be defined
      }
    }).catch(err => {
      console.error(`Failed to send cancellation notification to volunteer ${volunteerId}:`, err);
    })
  );
});




    // Wait for all notifications to be sent (but don't block response)
    Promise.all(notificationPromises).catch(err =>
      /* istanbul ignore next */ 
      console.error('Error sending notifications:', err)
    );
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    /* istanbul ignore next */
    console.error('Error deleting event:', error);
    /* istanbul ignore next */
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

module.exports = router;