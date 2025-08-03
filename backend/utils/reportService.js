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

module.exports = { getEventData };
