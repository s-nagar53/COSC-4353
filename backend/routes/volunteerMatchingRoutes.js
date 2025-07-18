// console.log('=== ROUTE FILE LOADED ==='); 
const express = require('express');
const router = express.Router();
const { profiles } = require('../data/memoryStore');
const { events } = require('../data/memoryEvents');
const notificationService = require('../utils/notificationService');
const NotificationAggregator = require('../utils/notificationAggregator');

// console.log('Total volunteers:', profiles.volunteers.length);
// console.log('Total events:', events.event.length);

const matchData = require('../data/memoryMatches');
const matches = matchData.matches;

// GET /api/matching/events
// Get all events for the event dropdown
router.get('/events', (req, res) => {
  try {
    // Sort events by urgency (Critical first, Low last)
    const sortedEvents = [...events.event].sort((a, b) => {
      return parseInt(b.urgency) - parseInt(a.urgency);
    });

    const formattedEvents = sortedEvents.map(event => ({
      id: event.eid,
      name: event.eventname,
      city: event.city,
      state: event.state,
      address: event.address,
      zip: event.zip,
      requiredSkills: event.skills,
      urgency: event.urgency,
      urgencyName: getUrgencyName(event.urgency),
      date: event.availability && event.availability[0] ? new Date(event.availability[0]).toISOString().split('T')[0] : 'TBD',
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

// Helper function to get urgency name
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

//GET /api/matching/volunteers/:eventId
// get volunteers that match the selected event's city and have at least one matching skill
router.get('/volunteers/:eventId', (req, res) => {
  try {
    const { eventId } = req.params;
    
    // find the selected event
    const selectedEvent = events.event.find(event => event.eid === eventId);
    
    if (!selectedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Normalize event data
    const eventCity = selectedEvent.city?.toLowerCase().trim();
    const eventSkills = selectedEvent.skills?.map(s => s.toLowerCase().trim()) || [];
    const eventDates = selectedEvent.availability || [];
    
    // Get volunteers not already matched to this event
    const matchedVolunteerIds = matches
      .filter(m => m.eventId === eventId)
      .map(m => m.volunteerId);

    // Ensure event has availability array
    if (!selectedEvent.availability || !Array.isArray(selectedEvent.availability)) {
      selectedEvent.availability = [];
    }

    // get all matches to check for date conflicts
    const allMatches = matches;

    // filter volunteers based on city match and skill overlap
    const matchingVolunteers = profiles.volunteers.filter(volunteer => {
      // Safety checks for volunteer data
      if (!volunteer || !volunteer.city || !volunteer.skills || !Array.isArray(volunteer.skills)) {
        console.log('⚠️ Skipping volunteer with invalid data:', volunteer);
        return false;
      }

      // Safety checks for event data
      if (!selectedEvent || !selectedEvent.city || !selectedEvent.skills) {
        console.log('⚠️ Event has missing data:', selectedEvent);
        return false;
      }

      // Skip already matched volunteers
      if (matchedVolunteerIds.includes(volunteer.uid)) {
        return false;
      }

      // check if volunteer's city matches event's city
      const cityMatch = volunteer.city.toLowerCase().trim() === selectedEvent.city.toLowerCase().trim();
      
      // check if volunteer has at least one matching skill
      const hasMatchingSkill = volunteer.skills.some(skill => 
        selectedEvent.skills.some(eventSkill => 
          skill.toLowerCase().trim() === eventSkill.toLowerCase().trim()
        )
      );

      // check availability - ensure volunteer has availability array
      if (!volunteer.availability || !Array.isArray(volunteer.availability)) {
        console.log('⚠️ Volunteer has no availability data:', volunteer.name);
        return false;
      }

      // check if volunteer is available on any of the event dates
      const hasAvailability = selectedEvent.availability.length === 0 || 
        selectedEvent.availability.some(eventDate => {
          // check if volunteer is already booked on this date
          const isBooked = allMatches.some(match => 
            match.volunteerId === volunteer.uid && 
            match.eventId !== eventId && // Different event
            match.event && 
            match.event.availability && 
            match.event.availability.includes(eventDate)
          );
          
          return !isBooked && volunteer.availability.includes(eventDate);
        });
        
      return cityMatch && hasMatchingSkill && hasAvailability;
    });

    // format volunteers for the dropdown
    const formattedVolunteers = matchingVolunteers.map(volunteer => ({
      id: volunteer.uid,
      name: volunteer.name,
      city: volunteer.city,
      state: volunteer.state,
      skills: volunteer.skills,
      availability: volunteer.availability || [],
      preferences: volunteer.preferences || 'None specified',
      matchingSkills: volunteer.skills.filter(skill => 
        selectedEvent.skills.some(eventSkill => 
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
          requiredSkills: selectedEvent.skills,
          availability: selectedEvent.availability
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
// Create a new volunteer-event match
router.post('/matches', (req, res) => {
  try {
    const { volunteerId, eventId } = req.body;

    // Validate required fields
    if (!volunteerId || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'Both volunteerId and eventId are required'
      });
    }

    // Find volunteer and event
    const volunteer = profiles.volunteers.find(v => v.uid === volunteerId);
    const event = events.event.find(e => e.eid === eventId);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if match already exists
    const existingMatch = matches.find(m => 
      m.volunteerId === volunteerId && m.eventId === eventId
    );

    if (existingMatch) {
      return res.status(409).json({
        success: false,
        message: 'This volunteer is already matched to this event'
      });
    }

    // Validate that volunteer meets event requirements
    const cityMatch = volunteer.city.toLowerCase() === event.city.toLowerCase();
    const hasMatchingSkill = volunteer.skills.some(skill => 
      event.skills.some(eventSkill => 
        skill.toLowerCase().trim() === eventSkill.toLowerCase().trim()
      )
    );

    if (!cityMatch) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer city does not match event city'
      });
    }

    if (!hasMatchingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Volunteer does not have required skills for this event'
      });
    }

    // Check availability conflicts
    if (volunteer.availability && event.availability) {
      const hasConflict = matches.some(match => 
        match.volunteerId === volunteerId && 
        match.eventId !== eventId &&
        match.event && 
        match.event.availability &&
        match.event.availability.some(date => event.availability.includes(date))
      );

      if (hasConflict) {
        return res.status(400).json({
          success: false,
          message: 'Volunteer has conflicting availability with another event'
        });
      }
    }

    // Create new match
    const newMatch = {
      id: matchData.matchIdCounter++,
      volunteerId,
      eventId,
      volunteerName: volunteer.name,
      eventName: event.eventname,
      matchedSkills: volunteer.skills.filter(skill => 
        event.skills.some(eventSkill => 
          skill.toLowerCase().trim() === eventSkill.toLowerCase().trim()
        )
      ),
      createdAt: new Date().toISOString(),
      status: 'active',
      volunteer: {
        id: volunteer.uid,
        name: volunteer.name,
        city: volunteer.city,
        skills: volunteer.skills
      },
      event: {
        id: event.eid,
        name: event.eventname,
        city: event.city,
        urgency: event.urgency,
        urgencyName: getUrgencyName(event.urgency),
        availability: event.availability || [],
        date: event.availability && event.availability[0] ? 
          new Date(event.availability[0]).toISOString().split('T')[0] : 'TBD'
      }
    };

    matchData.matches.push(newMatch);

    // Add match to volunteer's history
    if (!volunteer.history) volunteer.history = [];
    const historyEntry = {
      eid: event.eid,
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
    volunteer.history.push(historyEntry);

    // Send notification to volunteer for assignment
    notificationService.sendNotification(volunteer.uid, {
      type: 'assignment',
      message: `You have been assigned to the event: ${event.eventname}`,
      data: {
        eventId: event.eid,
        eventName: event.eventname,
        date: event.availability && event.availability[0] ? new Date(event.availability[0]).toISOString().split('T')[0] : 'TBD',
        city: event.city
      }
    });


    res.status(201).json({
      success: true,
      message: 'Match created successfully',
      data: newMatch
    });
  } catch (error) {
    console.error('Error creating match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create match',
      error: error.message
    });
  }
});

// GET /api/matching/matches
// Get all existing matches
router.get('/matches', (req, res) => {
  try {
    // Format matches with full details
    const formattedMatches = matches.map(match => {
      const volunteer = profiles.volunteers.find(v => v.uid === match.volunteerId);
      const event = events.event.find(e => e.eid === match.eventId);
      
      return {
        id: match.id,
        volunteer: {
          id: volunteer?.uid || match.volunteerId,
          name: volunteer?.name || match.volunteerName,
          skills: volunteer?.skills || [],
          city: volunteer?.city || 'Unknown'
        },
        event: {
          id: event?.eid || match.eventId,
          name: event?.eventname || match.eventName,
          requiredSkills: event?.skills || [],
          city: event?.city || 'Unknown',
          urgency: event?.urgency || match.event?.urgency,
          urgencyName: event ? getUrgencyName(event.urgency) : (match.event?.urgencyName || 'Unknown'),
          date: event?.availability?.[0] ? new Date(event.availability[0]).toISOString().split('T')[0] : 'TBD',
          availability: event?.availability || []
        },
        matchedSkills: match.matchedSkills || [],
        createdAt: match.createdAt,
        status: match.status
      };
    });

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
// Delete a specific match
router.delete('/matches/:matchId', (req, res) => {
  try {
    const { matchId } = req.params;
    const matchIndex = matches.findIndex(m => m.id === parseInt(matchId));

    if (matchIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const deletedMatch = matches.splice(matchIndex, 1)[0];
    
    // 🔄 Update volunteer history status to "Unmatched"
    if (deletedMatch?.volunteerId && deletedMatch?.eventId) {
      const volunteer = profiles.volunteers.find(v => v.uid === deletedMatch.volunteerId);
      if (volunteer?.history && Array.isArray(volunteer.history)) {
        const entry = volunteer.history.find(h => h.eid === deletedMatch.eventId);
        if (entry) {
          entry.participationStatus = 'Unmatched';
          entry.removedAt = new Date().toISOString(); // optional
        }
      }
    }
    // Send notification to volunteer for removal
    if (deletedMatch && deletedMatch.volunteerId) {
      let eventName = deletedMatch.eventName;
      if (!eventName && deletedMatch.eventId) {
        // Try to look up the event name from events
        const event = events.event.find(e => e.eid === deletedMatch.eventId);
        eventName = event ? event.eventname : 'the event';
      }
      notificationService.sendNotification(deletedMatch.volunteerId, {
        type: 'removed',
        message: `You have been removed from the event: ${eventName}`,
        data: {
          eventId: deletedMatch.eventId,
          eventName: eventName,
        }
      });
    }

    res.json({
      success: true,
      message: 'Match deleted successfully',
      data: deletedMatch
    });
  } catch (error) {
    console.error('Error deleting match:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete match',
      error: error.message
    });
  }
});

// GET /api/matching/volunteer-stats/:volunteerId
// Get volunteer's matching statistics
router.get('/volunteer-stats/:volunteerId', (req, res) => {
  try {
    const { volunteerId } = req.params;
    
    const volunteer = profiles.volunteers.find(v => v.uid === volunteerId);
    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found'
      });
    }

    const volunteerMatches = matches.filter(m => m.volunteerId === volunteerId);
    const totalMatches = volunteerMatches.length;
    const activeMatches = volunteerMatches.filter(m => m.status === 'active').length;
    
    // Find potential matches for this volunteer
    const potentialMatches = events.event.filter(event => {
      const cityMatch = volunteer.city.toLowerCase() === event.city.toLowerCase();
      const hasMatchingSkill = volunteer.skills.some(skill => 
        event.skills.some(eventSkill => 
          skill.toLowerCase().trim() === eventSkill.toLowerCase().trim()
        )
      );
      const notAlreadyMatched = !volunteerMatches.some(m => m.eventId === event.eid);
      
      return cityMatch && hasMatchingSkill && notAlreadyMatched;
    });

    res.json({
      success: true,
      data: {
        volunteer: {
          id: volunteer.uid,
          name: volunteer.name,
          city: volunteer.city,
          skills: volunteer.skills
        },
        statistics: {
          totalMatches,
          activeMatches,
          potentialMatches: potentialMatches.length
        },
        recentMatches: volunteerMatches.slice(-5), // Last 5 matches
        availableEvents: potentialMatches.slice(0, 10) // Next 10 potential matches
      }
    });
  } catch (error) {
    console.error('Error fetching volunteer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteer statistics',
      error: error.message
    });
  }
});

// GET /api/matching/event-stats/:eventId
// Get event's matching statistics
router.get('/event-stats/:eventId', (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = events.event.find(e => e.eid === eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const eventMatches = matches.filter(m => m.eventId === eventId);
    const totalMatches = eventMatches.length;
    const activeMatches = eventMatches.filter(m => m.status === 'active').length;
    
    // Find potential volunteers for this event
    const potentialVolunteers = profiles.volunteers.filter(volunteer => {
      const cityMatch = volunteer.city.toLowerCase() === event.city.toLowerCase();
      const hasMatchingSkill = volunteer.skills.some(skill => 
        event.skills.some(eventSkill => 
          skill.toLowerCase().trim() === eventSkill.toLowerCase().trim()
        )
      );
      const notAlreadyMatched = !eventMatches.some(m => m.volunteerId === volunteer.uid);
      
      return cityMatch && hasMatchingSkill && notAlreadyMatched;
    });

    res.json({
      success: true,
      data: {
        event: {
          id: event.eid,
          name: event.eventname,
          city: event.city,
          requiredSkills: event.skills,
          urgency: event.urgency
        },
        statistics: {
          totalMatches,
          activeMatches,
          potentialVolunteers: potentialVolunteers.length
        },
        currentMatches: eventMatches,
        availableVolunteers: potentialVolunteers.slice(0, 10) // Top 10 potential volunteers
      }
    });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event statistics',
      error: error.message
    });
  }
});

// POST /api/matching/reminder
// Body: { volunteerId, eventId, message }
router.post('/reminder', (req, res) => {
  const { volunteerId, eventId, message } = req.body;
  if (!volunteerId || !eventId || !message) {
    return res.status(400).json({ success: false, message: 'volunteerId, eventId, and message are required' });
  }
  const event = events.event.find(e => e.eid === eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  notificationService.sendNotification(volunteerId, {
    type: 'reminder',
    message,
    data: {
      eventId: event.eid,
      eventName: event.eventname,
      date: event.availability && event.availability[0] ? new Date(event.availability[0]).toISOString().split('T')[0] : 'TBD',
      city: event.city
    }
  });
  res.status(201).json({ success: true, message: 'Reminder notification sent' });
});

// GET /api/matching/match-notifications
router.get('/match-notifications', (req, res) => {
  try {
    const notificationsMap = NotificationAggregator.getMatchNotifications();
    res.json({ success: true, notifications: notificationsMap });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to aggregate notifications', error: error.message });
  }
});

// GET /api/matching/volunteer-history/:volunteerId
// Returns all events (with details) that a volunteer has participated in
router.get('/volunteer-history/:volunteerId', (req, res) => {
  try {
    const { volunteerId } = req.params;
    // Find all matches for this volunteer
    const volunteerMatches = matches.filter(m => m.volunteerId === volunteerId);
    // For each match, get the event details
    const eventHistory = volunteerMatches.map(match => {
      const event = events.event.find(e => e.eid === match.eventId);
      // Determine if this is the current event (active and event date is today or in the future)
      let participationStatus = 'Removed';
      if (match.status === 'active' && event?.availability?.length > 0) {
        const today = new Date();
        const eventDates = event.availability.map(date => new Date(date));
        if (eventDates.some(date => date >= today.setHours(0,0,0,0))) {
          participationStatus = 'Current';
        } else {
          participationStatus = 'Confirmed';
        }
      }
      return {
        eventName: event?.eventname || match.eventName || 'Unknown Event',
        eventDescription: event?.description || '',
        address1: event?.address || '',
        address2: '',
        city: event?.city || '',
        state: event?.state || '',
        zip: event?.zip || '',
        skills: match.matchedSkills || [],
        urgency: event?.urgency ? getUrgencyName(event.urgency) : '',
        availabilityDates: event?.availability || [],
        participationStatus,
        eventDate: event?.availability?.[0] || '',
        createdAt: match.createdAt || '',
      };
    });
    res.json({ success: true, data: eventHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch event history', error: error.message });
  }
});

module.exports = router;