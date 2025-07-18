// backend/__tests__/volunteerMatchingRoutes.test.js
const matchData = require('../data/memoryMatches');
const request = require('supertest');
const express = require('express');
const matchingRoutes = require('../routes/volunteerMatchingRoutes');
const { profiles } = require('../data/memoryStore');
const { events } = require('../data/memoryEvents');

const app = express();
app.use(express.json());
app.use('/api/matching', matchingRoutes);

beforeEach(() => {
  // Reset in-memory data
  profiles.volunteers = [
    {
      uid: 'vol1',
      name: 'Alice',
      city: 'Houston',
      state: 'TX',
      skills: ['Cooking', 'Setup'],
      availability: ['2025-07-20'],
    },
  ];

  events.event = [
    {
      eid: 'ev1',
      eventname: 'Food Drive',
      city: 'Houston',
      state: 'TX',
      address: '123 Main St',
      zip: '77001',
      skills: ['Cooking'],
      urgency: '3',
      availability: ['2025-07-20'],
    },
  ];

  // ✅ Reset matches and counter
  matchData.matches.length = 0;
  matchData.matchIdCounter = 1;
});


describe('GET /api/matching/events', () => {
  it('should return formatted events', async () => {
    const res = await request(app).get('/api/matching/events');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0]).toHaveProperty('urgencyName');
  });
});

describe('GET /api/matching/volunteers/:eventId', () => {
  it('should return matching volunteers for event', async () => {
    const res = await request(app).get('/api/matching/volunteers/ev1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.volunteers.length).toBeGreaterThan(0);
  });

  it('should return 404 for unknown event', async () => {
    const res = await request(app).get('/api/matching/volunteers/invalid');
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /api/matching/matches', () => {
  it('should create a new match', async () => {
    const res = await request(app).post('/api/matching/matches').send({
      volunteerId: 'vol1',
      eventId: 'ev1',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/created successfully/);
  });

  it('should prevent duplicate matches', async () => {
    await request(app).post('/api/matching/matches').send({ volunteerId: 'vol1', eventId: 'ev1' });
    const res = await request(app).post('/api/matching/matches').send({ volunteerId: 'vol1', eventId: 'ev1' });
    expect(res.statusCode).toBe(409);
  });
});

describe('GET /api/matching/matches', () => {
  it('should return all matches', async () => {
    await request(app).post('/api/matching/matches').send({ volunteerId: 'vol1', eventId: 'ev1' });
    const res = await request(app).get('/api/matching/matches');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('DELETE /api/matching/matches/:matchId', () => {
  it('should delete a match', async () => {
    const createRes = await request(app).post('/api/matching/matches').send({ volunteerId: 'vol1', eventId: 'ev1' });
    const matchId = createRes.body.data.id;
    const res = await request(app).delete(`/api/matching/matches/${matchId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/);
  });
});

describe('GET /api/matching/volunteer-stats/:volunteerId', () => {
  it('should return volunteer stats', async () => {
    const res = await request(app).get('/api/matching/volunteer-stats/vol1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.volunteer.id).toBe('vol1');
  });
});

describe('GET /api/matching/event-stats/:eventId', () => {
  it('should return event stats', async () => {
    const res = await request(app).get('/api/matching/event-stats/ev1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.event.id).toBe('ev1');
  });
});

it('should return 404 if match ID not found', async () => {
  const res = await request(app).delete('/api/matching/matches/9999');
  expect(res.statusCode).toBe(404);
  expect(res.body.message).toMatch(/Match not found/);
});

it('should return 404 if volunteer does not exist', async () => {
  const res = await request(app).post('/api/matching/matches').send({
    volunteerId: 'nonexistent',
    eventId: 'ev1',
  });
  expect(res.statusCode).toBe(404);
  expect(res.body.message).toMatch(/Volunteer not found/);
});

it('should return 404 if event does not exist', async () => {
  const res = await request(app).post('/api/matching/matches').send({
    volunteerId: 'vol1',
    eventId: 'invalid-ev',
  });
  expect(res.statusCode).toBe(404);
  expect(res.body.message).toMatch(/Event not found/);
});

it('should return 400 if volunteer city does not match event city', async () => {
  profiles.volunteers[0].city = 'Dallas'; // override city

  const res = await request(app).post('/api/matching/matches').send({
    volunteerId: 'vol1',
    eventId: 'ev1',
  });

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toMatch(/city does not match/i);
});

it('should return 400 if volunteer has no matching skills', async () => {
  profiles.volunteers[0].skills = ['Painting']; // irrelevant skill

  const res = await request(app).post('/api/matching/matches').send({
    volunteerId: 'vol1',
    eventId: 'ev1',
  });

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toMatch(/required skills/);
});
it('should return 400 if volunteer has a date conflict', async () => {
  // First match
  await request(app).post('/api/matching/matches').send({
    volunteerId: 'vol1',
    eventId: 'ev1',
  });

  // Add new event with same date
  events.event.push({
    eid: 'ev2',
    eventname: 'Conflicting Event',
    city: 'Houston',
    state: 'TX',
    address: '456 Oak St',
    zip: '77001',
    skills: ['Cooking'],
    urgency: '2',
    availability: ['2025-07-20'],
  });

  // Try to create a second match on same date
  const res = await request(app).post('/api/matching/matches').send({
    volunteerId: 'vol1',
    eventId: 'ev2',
  });

  expect(res.statusCode).toBe(400);
  expect(res.body.message).toMatch(/conflicting availability/);
});

it('should return 404 when deleting a non-existent match', async () => {
  const res = await request(app).delete('/api/matching/matches/9999');
  expect(res.statusCode).toBe(404);
  expect(res.body.message).toMatch(/Match not found/);
});

it('should return 404 if volunteer not found in stats route', async () => {
  const res = await request(app).get('/api/matching/volunteer-stats/notreal');
  expect(res.statusCode).toBe(404);
  expect(res.body.message).toMatch(/Volunteer not found/);
});

it('should return 404 if event not found in stats route', async () => {
  const res = await request(app).get('/api/matching/event-stats/invalid');
  expect(res.statusCode).toBe(404);
  expect(res.body.message).toMatch(/Event not found/);
});

it('should skip volunteer with invalid skills array', async () => {
  profiles.volunteers.push({
    uid: 'vol2',
    name: 'Bob',
    city: 'Houston',
    state: 'TX',
    skills: null, // <-- malformed
    availability: ['2025-07-20']
  });

  const res = await request(app).get('/api/matching/volunteers/ev1');
  expect(res.statusCode).toBe(200);
  expect(res.body.data.volunteers.length).toBe(1); // Only Alice should match
});

it('should create match even if event has no availability', async () => {
  events.event[0].availability = []; // Remove availability

  const res = await request(app).post('/api/matching/matches').send({
    volunteerId: 'vol1',
    eventId: 'ev1'
  });

  expect(res.statusCode).toBe(201);
});
it('should return match even if volunteer is missing', async () => {
  // Create match
  await request(app).post('/api/matching/matches').send({
    volunteerId: 'vol1',
    eventId: 'ev1'
  });

  // Remove volunteer
  profiles.volunteers = [];

  const res = await request(app).get('/api/matching/matches');
  expect(res.statusCode).toBe(200);
  expect(res.body.data[0].volunteer.name).toBe('Alice'); // from match fallback
});

it('should still calculate stats if event has no skills or availability', async () => {
  events.event[0].skills = [];
  events.event[0].availability = [];

  const res = await request(app).get('/api/matching/volunteer-stats/vol1');
  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
});
it('should still return event stats if volunteer has no skills', async () => {
  profiles.volunteers[0].skills = [];

  const res = await request(app).get('/api/matching/event-stats/ev1');
  expect(res.statusCode).toBe(200);
});
it('should return "Unknown Urgency" for invalid urgency code', async () => {
  events.event[0].urgency = '99'; // Not 1–4

  const res = await request(app).get('/api/matching/events');
  expect(res.body.data[0].urgencyName).toMatch(/Unknown/);
});

it('should skip volunteer with missing availability array in matching', async () => {
  profiles.volunteers.push({
    uid: 'vol2',
    name: 'No Dates',
    city: 'Houston',
    state: 'TX',
    skills: ['Cooking'],
    // no availability key
  });

  const res = await request(app).get('/api/matching/volunteers/ev1');
  expect(res.statusCode).toBe(200);
  expect(res.body.data.volunteers.find(v => v.id === 'vol2')).toBeUndefined();
});

it('should default event date to TBD if availability is empty', async () => {
  events.event[0].availability = [];

  const res = await request(app).get('/api/matching/events');
  expect(res.body.data[0].date).toBe('TBD');
});

it('should fallback urgencyName to match data if event is missing', async () => {
  // Create match first
  await request(app).post('/api/matching/matches').send({
    volunteerId: 'vol1',
    eventId: 'ev1'
  });

  // Remove the event (simulate missing event scenario)
  events.event = [];

  const res = await request(app).get('/api/matching/matches');
  expect(res.statusCode).toBe(200);
  expect(res.body.data[0].event.urgencyName).toBeDefined();
});

describe('POST /api/matching/reminder', () => {
  it('should send a reminder notification', async () => {
    const res = await request(app).post('/api/matching/reminder').send({
      volunteerId: 'vol1',
      eventId: 'ev1',
      message: 'Test reminder message'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/Reminder notification sent/);
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post('/api/matching/reminder').send({
      volunteerId: 'vol1',
      // missing eventId and message
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/required/);
  });
});

describe('GET /api/matching/volunteer-history/:volunteerId', () => {
  it('should return volunteer history', async () => {
    // First create a match to have history
    await request(app).post('/api/matching/matches').send({
      volunteerId: 'vol1',
      eventId: 'ev1'
    });

    const res = await request(app).get('/api/matching/volunteer-history/vol1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should return empty array if volunteer has no history', async () => {
    const res = await request(app).get('/api/matching/volunteer-history/vol1');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(0);
  });
});

describe('GET /api/matching/match-notifications', () => {
  it('should return aggregated match notifications', async () => {
    const res = await request(app).get('/api/matching/match-notifications');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notifications).toBeDefined();
  });
});

describe('Event urgency formatting', () => {
  it('should include urgency name in event responses', async () => {
    const res = await request(app).get('/api/matching/events');
    expect(res.statusCode).toBe(200);
    expect(res.body.data[0]).toHaveProperty('urgencyName');
    expect(res.body.data[0].urgencyName).toMatch(/Urgency/);
  });

  it('should include urgency name in match responses', async () => {
    // First create a match
    await request(app).post('/api/matching/matches').send({
      volunteerId: 'vol1',
      eventId: 'ev1'
    });
    
    const res = await request(app).get('/api/matching/matches');
    expect(res.statusCode).toBe(200);
    expect(res.body.data[0].event).toHaveProperty('urgencyName');
    expect(res.body.data[0].event.urgencyName).toMatch(/Urgency/);
  });
});

describe('Volunteer history edge cases', () => {
  it('should handle volunteer with matches to deleted events', async () => {
    // Create a match first
    await request(app).post('/api/matching/matches').send({
      volunteerId: 'vol1',
      eventId: 'ev1'
    });

    // Delete the event (simulate case where event was deleted but match remains)
    events.event = [];

    const res = await request(app).get('/api/matching/volunteer-history/vol1');
    expect(res.statusCode).toBe(200);
    expect(res.body.data[0].eventName).toBeDefined(); // Should fall back to match data
  });
});

describe('Match creation edge cases', () => {
  it('should create match when volunteer has no availability array', async () => {
    // Remove availability from volunteer
    profiles.volunteers[0].availability = undefined;

    const res = await request(app).post('/api/matching/matches').send({
      volunteerId: 'vol1',
      eventId: 'ev1'
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });
});