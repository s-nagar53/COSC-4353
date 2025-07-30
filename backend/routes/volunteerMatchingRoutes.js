// volunteerMatchingRoutes.js
const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const notificationService = require('../utils/notificationService');
const NotificationAggregator = require('../utils/notificationAggregator');
const admin = require('firebase-admin');

// Firestore collections
const eventsCollection = db.collection('events');
const profilesCollection = db.collection('users');
const matchesCollection = db.collection('matches');

// GET /api/matching/events
router.get('/events', async (req, res) => {
  try {
    const snapshot = await eventsCollection.get();
    const events = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to start of day

    
    snapshot.forEach(doc => {
      const event = doc.data();

      // Filter out events where all availability dates have passed
      if (event.availability && Array.isArray(event.availability)) {
        const hasFutureDate = event.availability.some(dateStr => {
          const eventDate = new Date(dateStr);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        });
        if (!hasFutureDate) {
          return; // Skip this event if all dates are in the past
        }
      }
      
      events.push({
        id: doc.id,
        eid: doc.id, // maintain compatibility
        ...event
      });
    });

    // Sort events by urgency (Critical first, Low last)
    const sortedEvents = events.sort((a, b) => {
      return parseInt(b.urgency) - parseInt(a.urgency);
    });

    const formattedEvents = sortedEvents.map(event => ({
      id: event.eid,
      name: event.eventname,
      city: event.city,
      state: event.state,
      address: event.address,
      zip: event.zip,
      requiredSkills: event.skills || [],
      urgency: event.urgency,
      urgencyName: getUrgencyName(event.urgency),
      date: event.availability && event.availability[0] ? 
            new Date(event.availability[0]).toISOString().split('T')[0] : 'TBD',
      availability: event.availability || []
    }));

    res.json({
      success: true,
      data: formattedEvents
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events',
      error: error.message
    });
  }
});

// GET /api/matching/volunteers/:eventId
router.get('/volunteers/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    console.log(`🔍 Fetching volunteers for event: ${eventId}`);
    
    // Get the selected event
    const eventDoc = await eventsCollection.doc(eventId).get();
    if (!eventDoc.exists) {
      console.log('❌ Event not found');
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    const selectedEvent = eventDoc.data();
    console.log('ℹ️ Event Data:', {
      city: selectedEvent.city,
      skills: selectedEvent.skills,
      availability: selectedEvent.availability
    });

    selectedEvent.eid = eventId; // Add the ID

    // Get all matches for this event
    const matchesSnapshot = await matchesCollection
      .where('eventId', '==', eventId)
      .get();
    const matchedVolunteerIds = matchesSnapshot.docs.map(doc => doc.data().volunteerId);

    console.log('🚫 Already matched volunteers:', matchedVolunteerIds);

    // Get all volunteers
    const volunteersSnapshot = await db.collection('users')
      .where('role', '==', 'volunteer')
      .get();
    const volunteers = volunteersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
    console.log('👥 All volunteers:', volunteersSnapshot.size);

    // Filter volunteers based on criteria

    console.log('🔍 Checking volunteers against event:');
    console.log('Event City:', selectedEvent.city);
    console.log('Event Skills:', selectedEvent.skills);
    console.log('Event Availability:', selectedEvent.availability);

    const matchingVolunteers = volunteers.filter(volunteer => {
      // Skip invalid or already matched volunteers
      console.log(`\nChecking volunteer ${volunteer.uid} (${volunteer.name})`);
      console.log('Volunteer City:', volunteer.city);
      console.log('Volunteer Skills:', volunteer.skills);
      console.log('Volunteer Availability:', volunteer.availability);
      
      console.log(`\n🔎 Checking volunteer ${volunteer.uid} (${volunteer.name})`);

      if (!volunteer || !volunteer.city || !volunteer.skills || 
          !Array.isArray(volunteer.skills) || 
          matchedVolunteerIds.includes(volunteer.uid)) {
        console.log('⏩ Skipping - missing city, skills, or already matched');
        return false;
      }

      // Check city match
      const cityMatch = volunteer.city.toLowerCase().trim() === 
                       selectedEvent.city.toLowerCase().trim();
      
      // Check skill match
      const hasMatchingSkill = volunteer.skills.some(skill => 
        (selectedEvent.skills || []).some(eventSkill => 
          skill.toLowerCase().trim() === eventSkill.toLowerCase().trim()
        )
      );
      

      // Check availability
      const hasAvailability = !selectedEvent.availability || 
        selectedEvent.availability.length === 0 ||
        selectedEvent.availability.some(eventDate => {
          return volunteer.availability && 
                 volunteer.availability.includes(eventDate);
        });
        
      return cityMatch && hasMatchingSkill && hasAvailability;
    });

    // Format response
    const formattedVolunteers = matchingVolunteers.map(volunteer => ({
      id: volunteer.uid,
      name: volunteer.name,
      city: volunteer.city,
      state: volunteer.state,
      skills: volunteer.skills || [],
      availability: volunteer.availability || [],
      preferences: volunteer.preferences || 'None specified',
      matchingSkills: (volunteer.skills || []).filter(skill => 
        (selectedEvent.skills || []).some(eventSkill => 
          skill.toLowerCase().trim() === eventSkill.toLowerCase().trim()
        )
      )
    }));

    res.json({
      success: true,
      data: {
        volunteers: formattedVolunteers,
        eventDetails: {
          id: selectedEvent.eid,
          name: selectedEvent.eventname,
          city: selectedEvent.city,
          state: selectedEvent.state,
          requiredSkills: selectedEvent.skills || [],
          availability: selectedEvent.availability || []
        }
      }
    });
  } catch (error) {
    console.error('Error fetching matching volunteers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch matching volunteers',
      error: error.message
    });
  }
});

// POST /api/matching/matches
router.post('/matches', async (req, res) => {
  let matchRef = null;

  try {
    const { volunteerId, eventId } = req.body;

    // Validate inputs
    if (!volunteerId || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Both volunteerId and eventId are required'
      });
    }

    // Get volunteer and event
    const [volunteerDoc, eventDoc] = await Promise.all([
      db.collection('users').doc(volunteerId).get(),
      eventsCollection.doc(eventId).get()
    ]);

    if (!volunteerDoc.exists) {
      console.error('Volunteer not found in Firestore:', volunteerId);
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }
    const volunteer = volunteerDoc.data();
    volunteer.uid = volunteerId;

    if (!eventDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    const event = eventDoc.data();
    event.eid = eventId;

    // Check for existing match
    const existingMatch = await matchesCollection
      .where('volunteerId', '==', volunteerId)
      .where('eventId', '==', eventId)
      .limit(1)
      .get();

    if (!existingMatch.empty) {
      return res.status(409).json({
        success: false,
        message: 'This volunteer is already matched to this event'
      });
    }

    // Validate requirements
    const cityMatch = volunteer.city.toLowerCase() === event.city.toLowerCase();
    const hasMatchingSkill = (volunteer.skills || []).some(skill => 
      (event.skills || []).some(eventSkill => 
        skill.toLowerCase().trim() === eventSkill.toLowerCase().trim()
        )
      );

    if (!cityMatch || !hasMatchingSkill) {
      return res.status(400).json({
        success: false,
        message: !cityMatch ? 
          'Volunteer city does not match event city' :
          'Volunteer does not have required skills for this event'
      });
    }

// Create new match
  const newMatch = {
    volunteerId,
    eventId,
    volunteerName: volunteer.name,
    eventName: event.eventname,
    matchedSkills: (volunteer.skills || []).filter(skill => 
      (event.skills || []).some(eventSkill => 
        skill.toLowerCase().trim() === eventSkill.toLowerCase().trim()
        )
      ),
    createdAt: new Date().toISOString(),
    matchStatus: 'active' // Changed from 'status' to 'matchStatus' to avoid deprecation
  };

    // Add to Firestore
    matchRef = await matchesCollection.add(newMatch);
    const matchId = matchRef.id;

    // Update volunteer history
    try {
      const historyEntry = {
        eid: eventId,
        eventname: event.eventname,
        eventDescription: event.eventDescription || '—',
        address: event.address || '',
        city: event.city || '',
        state: event.state || '',
        zip: event.zip || '',
        skills: event.skills || [],
        participationStatus: 'Confirmed',
        eventDate: event.availability?.[0] || '',
        urgency: event.urgency || '1'
      };

      await db.collection('users').doc(volunteerId).update({
        history: admin.firestore.FieldValue.arrayUnion(historyEntry)
      });
    } catch (historyError) {
      console.error('History update failed:', historyError);
      // Don't fail the whole request if history update fails
    }

        // Send notification (fire and forget)
        try {
          await notificationService.sendNotification(volunteerId, {
            type: 'assignment',
            message: `You have been assigned to: ${event.eventname}`,
            data: {
              eventId: event.eid,
              eventName: event.eventname,
              date: event.availability?.[0]?.split('T')[0] || 'TBD',
              city: event.city
            }
          });
        } catch (notifError) {
          console.error('Notification failed:', notifError);
        }
    
        return res.status(201).json({
          success: true,
          message: 'Match created successfully',
          data: { 
            id: matchId, 
            ...newMatch,
            // Include full details for frontend
            volunteer: {
              id: volunteer.uid,
              name: volunteer.name,
              city: volunteer.city,
              skills: volunteer.skills || []
            },
            event: {
              id: event.eid,
              name: event.eventname,
              city: event.city,
              urgency: event.urgency,
              urgencyName: getUrgencyName(event.urgency),
              date: event.availability?.[0]?.split('T')[0] || 'TBD'
            }
          }
        });
    
      } catch (error) {
        console.error('Match creation failed:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to create match',
          error: error.message,
          matchId: matchRef?.id || null
        });
      }
    });

// GET /api/matching/matches
router.get('/matches', async (req, res) => {
  try {
    const snapshot = await matchesCollection.get();
    const matches = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get full details for each match
    const formattedMatches = await Promise.all(matches.map(async match => {
      const [volunteerDoc, eventDoc] = await Promise.all([
        profilesCollection.doc(match.volunteerId).get(),
        eventsCollection.doc(match.eventId).get()
      ]);

      const volunteer = volunteerDoc.exists ? volunteerDoc.data() : null;
      const event = eventDoc.exists ? eventDoc.data() : null;

      return {
        id: match.id,
        volunteer: {
          id: match.volunteerId,
          name: volunteer?.name || match.volunteerName,
          skills: volunteer?.skills || [],
          city: volunteer?.city || 'Unknown'
        },
        event: {
          id: match.eventId,
          name: event?.eventname || match.eventName,
          requiredSkills: event?.skills || [],
          city: event?.city || 'Unknown',
          urgency: event?.urgency,
          urgencyName: event ? getUrgencyName(event.urgency) : 'Unknown',
          date: event?.availability?.[0] ? 
                new Date(event.availability[0]).toISOString().split('T')[0] : 'TBD',
          availability: event?.availability || []
        },
        matchedSkills: match.matchedSkills || [],
        createdAt: match.createdAt,
        status: match.status
      };
    }));

    res.json({
      success: true,
      data: formattedMatches
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch matches',
      error: error.message
    });
  }
});

// DELETE /api/matching/matches/:matchId
router.delete('/matches/:matchId', async (req, res) => {
  try {
    const { matchId } = req.params;
    const matchDoc = await matchesCollection.doc(matchId).get();

    if (!matchDoc.exists) {
      console.log(`[DEBUG] Match with ID ${matchId} not found.`);
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const match = matchDoc.data();
    const { volunteerId, eventId, eventName } = match;

    console.log(`[DEBUG] Attempting to delete match ID: ${matchId}`);
    console.log(`[DEBUG] Match details - Volunteer ID: ${volunteerId} (Type: ${typeof volunteerId}), Event ID: ${eventId} (Type: ${typeof eventId}), Event Name: ${eventName}`);

    // Delete the match document first
    await matchesCollection.doc(matchId).delete();
    console.log(`[DEBUG] Match document ${matchId} deleted from 'matches' collection.`);

    // Now, update volunteer's history
    const volunteerRef = profilesCollection.doc(volunteerId);
    const volunteerDoc = await volunteerRef.get();
    
    if (volunteerDoc.exists) {
      const volunteer = volunteerDoc.data();
      if (volunteer.history && Array.isArray(volunteer.history)) {
        const currentHistory = volunteer.history;
        console.log(`[DEBUG] Volunteer ${volunteerId} current history (before filter):`, JSON.stringify(currentHistory, null, 2));
        console.log(`[DEBUG] Target Event ID for removal: ${eventId} (Type: ${typeof eventId})`);
        
        const updatedHistory = currentHistory.filter(entry => {
          // Log each comparison to explicitly see why an entry is or isn't filtered
          console.log(`[DEBUG]   Comparing history entry.eid: ${entry.eid} (Type: ${typeof entry.eid}) with target eventId: ${eventId} (Type: ${typeof eventId})`);
          console.log(`[DEBUG]   Result of entry.eid !== eventId: ${entry.eid !== eventId}`);
          return entry.eid !== eventId;
        });

        console.log(`[DEBUG] Volunteer ${volunteerId} updated history (after filter):`, JSON.stringify(updatedHistory, null, 2));

        // Only update if the history array length has changed (meaning an item was removed)
        if (updatedHistory.length < currentHistory.length) {
            await volunteerRef.update({ history: updatedHistory });
            console.log(`[DEBUG] Volunteer ${volunteerId} history UPDATED in Firestore.`);
        } else {
            console.log(`[DEBUG] Volunteer ${volunteerId} history NOT UPDATED: Event ID ${eventId} was not found in history, or history length did not change.`);
        }
      } else {
          console.log(`[DEBUG] Volunteer ${volunteerId} has no 'history' field or it's not an array.`);
      }
    } else {
        console.log(`[DEBUG] Volunteer document ${volunteerId} not found in 'users' collection.`);
    }

    // Send notification
    await notificationService.sendNotification(volunteerId, {
      type: 'removed',
      message: `You have been removed from the event: ${eventName}`,
      data: {
        eventId: eventId,
        eventName: eventName,
      }
    });
    console.log(`[DEBUG] Notification sent to volunteer ${volunteerId}.`);

    res.json({
      success: true,
      message: 'Match deleted successfully',
      data: { id: matchId, ...match }
    });
  } catch (error) {
    console.error('[ERROR] Error deleting match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete match',
      error: error.message
    });
  }
});

// GET /api/matching/volunteer-history/:volunteerId
router.get('/volunteer-history/:volunteerId', async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const volunteerDoc = await db.collection('users').doc(volunteerId).get();

    if (!volunteerDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    const volunteer = volunteerDoc.data();
    const history = volunteer.history || [];

    // Get event details for each history entry
    const eventHistory = await Promise.all(history.map(async entry => {
      let eventDetails = {};
      try {
        const eventDoc = await eventsCollection.doc(entry.eid).get();
        if (eventDoc.exists) {
          eventDetails = eventDoc.data();
        }
      } catch (error) {
        console.error(`Error fetching event ${entry.eid}:`, error);
      }

      // Determine participation status
      let participationStatus = entry.participationStatus || 'Unknown';
      if (participationStatus === 'Confirmed' && eventDetails.availability) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const eventDates = eventDetails.availability.map(date => new Date(date));
        
        const hasFutureDate = eventDates.some(date => {
          date.setHours(0, 0, 0, 0); // Normalize event date
          return date >= today;
        });

        if (hasFutureDate) {
          participationStatus = 'Current';
        } else {
          // All dates have passed, mark as Completed
          participationStatus = 'Completed'; 
        }
      }

      return {
        eventName: entry.eventname || eventDetails.eventname || 'Unknown Event',
        eventDescription: entry.eventDescription || eventDetails.description || '',
        address1: entry.address || eventDetails.address || '',
        address2: '',
        city: entry.city || eventDetails.city || '',
        state: entry.state || eventDetails.state || '',
        zip: entry.zip || eventDetails.zip || '',
        skills: entry.skills || eventDetails.skills || [],
        urgency: entry.urgency || eventDetails.urgency || '',
        availabilityDates: eventDetails.availability || [],
        participationStatus,
        eventDate: entry.eventDate || (eventDetails.availability?.[0] || ''),
        createdAt: entry.createdAt || ''
      };
    }));

    res.json({ 
      success: true, 
      data: eventHistory
    });
  } catch (error) {
    console.error('Error fetching volunteer history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch event history', 
      error: error.message 
    });
  }
});

// Keep existing helper functions
function getUrgencyName(code) {
  const Urgency_LVL = [
    { code: '1', name: 'Low' },
    { code: '2', name: 'Medium' },
    { code: '3', name: 'High' },
    { code: '4', name: 'Critical' },
  ];
  const baseName = Urgency_LVL.find(lvl => lvl.code === code)?.name || 'Unknown';
  return `${baseName} Urgency`;
}

module.exports = router;