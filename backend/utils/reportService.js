const { db } = require('../firebase');

async function getEventData() {
  const eventSnapshot = await db.collection('events').get();
  const matchSnapshot = await db.collection('matches').get();

  const matchMap = {};

  // Group all matches by eventId (NO status filtering)
  matchSnapshot.forEach(doc => {
    const match = doc.data();
    const eventId = match.eventId;

    if (!matchMap[eventId]) {
      matchMap[eventId] = [];
    }

    matchMap[eventId].push({
      volunteerName: match.volunteerName,
      matchedSkills: (match.matchedSkills || []).join(', ')
    });
  });

  const events = [];

  eventSnapshot.forEach(doc => {
    const data = doc.data();
    const eventId = data.eid;

    events.push({
      eventname: data.eventname || 'Untitled Event',
      address: data.address || '',
      address2: data.address2 || '',
      city: data.city || '',
      state: data.state || '',
      zip: data.zip || '',
      requiredSkills: (data.requiredSkills || []).join(', '),
      availability: (data.availability || []).join(', '),
      urgency: mapUrgency(data.urgency),
      createdAt: data.createdAt?.toDate().toLocaleDateString() || 'N/A',
      matchedVolunteers: matchMap[eventId] || []
    });
  });

  return events;
}

function mapUrgency(level) {
  const map = {
    '1': 'Low',
    '2': 'Medium',
    '3': 'High',
    '4': 'Critical'
  };
  return map[level] || 'Unknown';
}

async function getVolunteerData() {
  try {
    const volunteers = [];

    // 1. Fetch all volunteers
    const volunteersSnapshot = await db.collection('users')
      .where('role', '==', 'volunteer')
      .get();
    
    // 2. Fetch all matches and events in one go to minimize reads
    const matchesSnapshot = await db.collection('matches').get();
    const matchesByVolunteerId = {};
    matchesSnapshot.forEach(doc => {
      const data = doc.data();
      if (!matchesByVolunteerId[data.volunteerId]) {
        matchesByVolunteerId[data.volunteerId] = [];
      }
      matchesByVolunteerId[data.volunteerId].push(data);
    });

    const eventIds = new Set(matchesSnapshot.docs.map(doc => doc.data().eventId));
    const events = {};
    const eventPromises = Array.from(eventIds).map(eid =>
      db.collection('events').doc(eid).get().then(doc => {
        if (doc.exists) {
          events[doc.id] = doc.data();
        }
      })
    );
    await Promise.all(eventPromises);

    // 3. Combine volunteer, match, and event data
    volunteersSnapshot.forEach(volunteerDoc => {
      const volunteerData = volunteerDoc.data();
      const volunteerHistory = [];
      const volunteerMatches = matchesByVolunteerId[volunteerDoc.id] || [];

      volunteerMatches.forEach(match => {
        const eventData = events[match.eventId];
        if (eventData) {
          volunteerHistory.push({
            eventName: eventData.eventname,
            eventDate: eventData.availability && eventData.availability[0] ?
              new Date(eventData.availability[0]).toISOString().split('T')[0] : 'N/A',
            participationStatus: match.matchStatus || 'Pending',
            address: eventData.address || 'N/A',
            city: eventData.city || 'N/A',
            state: eventData.state || 'N/A',
            zip: eventData.zip || 'N/A',
          });
        }
      });

      volunteers.push({
        name: volunteerData.name,
        email: volunteerData.email || 'N/A',
        phone: volunteerData.phone || 'N/A',
        address: volunteerData.address || 'N/A',
        city: volunteerData.city || 'N/A',
        state: volunteerData.state || 'N/A',
        zip: volunteerData.zip || 'N/A',
        skills: volunteerData.skills || [],
        totalEvents: volunteerHistory.length,
        history: volunteerHistory
      });
    });

    return volunteers;

  } catch (error) {
    console.error('Error fetching volunteer data for report:', error);
    throw new Error('Failed to fetch volunteer data');
  }
}


module.exports = { getEventData, getVolunteerData };
