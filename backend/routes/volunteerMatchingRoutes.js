// console.log('=== ROUTE FILE LOADED ==='); 
const express = require('express');
const router = express.Router();
const { profiles } = require('../data/memoryStore');
const { events } = require('../data/memoryEvents');

// console.log('Total volunteers:', profiles.volunteers.length);
// console.log('Total events:', events.event.length);

// DATA VALIDATION
// const testDataIntegrity = () => {
//     console.log('=== DATA INTEGRITY CHECK ===');
    
//     // Check events
//     console.log('Events count:', events.event.length);
//     events.event.forEach((event, index) => {
//       console.log(`Event ${index}:`, {
//         eid: event.eid,
//         name: event.eventname,
//         city: event.city,
//         skills: event.skills,
//         hasRequiredFields: !!(event.eid && event.eventname && event.city && event.skills)
//       });
//     });
    
//     // Check volunteers
//     console.log('Volunteers count:', profiles.volunteers.length);
//     profiles.volunteers.forEach((volunteer, index) => {
//       console.log(`Volunteer ${index}:`, {
//         uid: volunteer.uid,
//         name: volunteer.name,
//         city: volunteer.city,
//         skills: volunteer.skills,
//         hasRequiredFields: !!(volunteer.uid && volunteer.name && volunteer.city && volunteer.skills)
//       });
//     });
//   };
  
// // Call this function to check your data
// testDataIntegrity();

// In-memory storage for matches (since no database yet)
let matches = [];
let matchIdCounter = 1;


 // GET /api/matching/events
 // Get all events for the event dropdown

router.get('/events', (req, res) => {
  try {
    const formattedEvents = events.event.map(event => ({
      id: event.eid,
      name: event.eventname,
      city: event.city,
      state: event.state,
      address: event.address,
      zip: event.zip,
      requiredSkills: event.skills,
      urgency: event.urgency,
      date: event.availability[0] ? new Date(event.availability[0]).toISOString().split('T')[0] : 'TBD'
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


 //GET /api/matching/volunteers/:eventId
 // Get volunteers that match the selected event's city and have at least one matching skill

router.get('/volunteers/:eventId', (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Find the selected event
    const selectedEvent = events.event.find(event => event.eid === eventId);
    
    if (!selectedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get existing matches for this event
    const eventMatches = matches.filter(m => m.eventId === eventId);
    const matchedVolunteerIds = eventMatches.map(m => m.volunteerId);

    // Filter volunteers based on city match and skill overlap
    const matchingVolunteers = profiles.volunteers.filter(volunteer => {
      // Safety checks
        if (!volunteer || !volunteer.city || !volunteer.skills || !Array.isArray(volunteer.skills)) {
            console.log('⚠️ Skipping volunteer with invalid data:', volunteer);
            return false;
        }

        if (!selectedEvent || !selectedEvent.city || !selectedEvent.skills) {
            console.log('⚠️ Event has missing data:', selectedEvent);
            return false;
          }
        // Skip already matched volunteers
        if (matchedVolunteerIds.includes(volunteer.uid)) {
            return false;
        }
       // Check if volunteer's city matches event's city
       const cityMatch = volunteer.city.toLowerCase().trim() === selectedEvent.city.toLowerCase().trim();
      
    // Check if volunteer has at least one matching skill
        const hasMatchingSkill = volunteer.skills.some(skill => 
            selectedEvent.skills.some(eventSkill => 
            skill.toLowerCase().trim() === eventSkill.toLowerCase().trim()
            )
        );
        
      return cityMatch && hasMatchingSkill;
    });


    // Format volunteers for the dropdown
    const formattedVolunteers = matchingVolunteers.map(volunteer => ({
      id: volunteer.uid,
      name: volunteer.name,
      city: volunteer.city,
      state: volunteer.state,
      skills: volunteer.skills,
      availability: volunteer.availability,
      preferences: volunteer.preferences || 'None specified',
      matchingSkills: volunteer.skills.filter(skill => 
        selectedEvent.skills.includes(skill)
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
          requiredSkills: selectedEvent.skills
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
      event.skills.includes(skill)
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

    // Create new match
    const newMatch = {
      id: matchIdCounter++,
      volunteerId,
      eventId,
      volunteerName: volunteer.name,
      eventName: event.eventname,
      matchedSkills: volunteer.skills.filter(skill => event.skills.includes(skill)),
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    matches.push(newMatch);

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
          date: event?.availability?.[0] ? new Date(event.availability[0]).toISOString().split('T')[0] : 'TBD'
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
        event.skills.includes(skill)
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
        event.skills.includes(skill)
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

module.exports = router;