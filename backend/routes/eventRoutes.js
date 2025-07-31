const express = require('express');
const router = express.Router();
const { db } = require('../firebase'); // Import Firestore
const { validateEvent } = require('../utils/validateEvent');
const notificationService = require('../utils/notificationService');
const matchData = require('../data/memoryMatches');
const { events } = require('../data/memoryEvents');

// Firestore collection reference
const eventsCollection = db.collection('events');

// Sync Firestore events to in-memory events
async function syncEventsToMemory() {
  try {
    const snapshot = await eventsCollection.get();
    events.event = [];
    snapshot.forEach(doc => {
      events.event.push({
        id: doc.id,
        ...doc.data()
      });
    });
    console.log(`✅ Synced ${events.event.length} events from Firestore to memory`);
  } catch (error) {
    console.error('❌ Error syncing events to memory:', error);
  }
}

// Sync events on startup
syncEventsToMemory();

// Get all events (MUST come before /:eid)
router.get('/all', async (req, res) => {
  try {
    console.log('📋 Fetching all events from Firestore');
    
    const snapshot = await eventsCollection.get();
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
    const eventRef = eventsCollection.doc(eid);
    const existingEvent = await eventRef.get();
    
    if (existingEvent.exists) {
      // Update existing event (preserve createdAt)
      delete eventData.createdAt;
      await eventRef.update(eventData);
      
      // Also update in-memory events for volunteer matching
      const existingIndex = events.event.findIndex(e => e.eid === eid);
      if (existingIndex !== -1) {
        events.event[existingIndex] = { ...events.event[existingIndex], ...eventData };
      }
    } else {
      // Create new event
      await eventRef.set(eventData);
      
      // Also add to in-memory events for volunteer matching
      events.event.push(eventData);
    }

    // Notify all matched volunteers for this event about the update
    const matchesSnapshot = await matchData.getMatchesByEventId(eid);
    
    console.log(`📢 Found ${matchesSnapshot.length} matched volunteers for event ${eid}`);
    console.log(`📢 Event updated: ${eventData.eventname} (${eid})`);
    
    const notificationPromises = [];
    matchesSnapshot.forEach(match => {
      console.log(`📢 Sending update notification to volunteer ${match.volunteerId} for event ${eid}`);
      notificationPromises.push(
        notificationService.sendNotification(match.volunteerId, {
          type: 'event_update',
          message: `Event '${eventData.eventname}' has been updated.`,
          data: {
            eventId: eventData.eid,
            eventName: eventData.eventname,
            date: eventData.availability && eventData.availability[0] ? 
              new Date(eventData.availability[0]).toISOString().split('T')[0] : 'TBD',
            city: eventData.city
          }
        }).catch(err => {
          console.error(`Failed to send notification to volunteer ${match.volunteerId}:`, err);
        })
      );
    });

    // Wait for all notifications to be sent (but don't block response)
    Promise.all(notificationPromises).catch(err => 
      console.error('Error sending notifications:', err)
    );

    res.status(200).json({ message: 'Event saved successfully' });
  } catch (error) {
    console.error('Error saving event:', error);
    res.status(500).json({ message: 'Failed to save event' });
  }
});

// Get event by eid (MUST come after /all)
router.get('/:eid', async (req, res) => {
  try {
    const eid = req.params.eid;
    console.log('📋 Looking for event with eid:', eid);

    const doc = await eventsCollection.doc(eid).get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = {
      id: doc.id,
      ...doc.data()
    };

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Failed to fetch event' });
  }
});

// Delete event
router.delete('/:eid', async (req, res) => {
  try {
    const eid = req.params.eid;
    
    const eventRef = eventsCollection.doc(eid);
    const eventDoc = await eventRef.get();
    
    if (!eventDoc.exists) {
      console.log('❌ Event not found for deletion:', eid);
      return res.status(404).json({ message: 'Event not found' });
    }

    // Get event data before deletion for notifications
    const eventData = eventDoc.data();
    
    // Delete the event
    await eventRef.delete();
    
    // Also remove from in-memory events for volunteer matching
    const existingIndex = events.event.findIndex(e => e.eid === eid);
    if (existingIndex !== -1) {
      events.event.splice(existingIndex, 1);
    }
    
    console.log('✅ Event deleted:', eid);
    
    // Notify all matched volunteers for this event about the cancellation
    const matchesSnapshot = await matchData.getMatchesByEventId(eid);
    
    console.log(`📢 Found ${matchesSnapshot.length} matched volunteers for cancelled event ${eid}`);
    
    const notificationPromises = [];
    matchesSnapshot.forEach(match => {
      console.log(`📢 Sending cancellation notification to volunteer ${match.volunteerId} for event ${eid}`);
      notificationPromises.push(
        notificationService.sendNotification(match.volunteerId, {
          type: 'event_cancelled',
          message: `Event '${eventData.eventname || eid}' has been cancelled or deleted.`,
          data: {
            eventId: eid
          }
        }).catch(err => {
          console.error(`Failed to send cancellation notification to volunteer ${match.volunteerId}:`, err);
        })
      );
    });

    // Wait for all notifications to be sent (but don't block response)
    Promise.all(notificationPromises).catch(err => 
      console.error('Error sending notifications:', err)
    );
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

module.exports = router;
