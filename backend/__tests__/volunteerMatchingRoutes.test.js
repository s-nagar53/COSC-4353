/*// backend/__tests__/volunteerMatchingRoutes.test.js
const matchData = require('../data/memoryMatches');
const request = require('supertest');
const express = require('express');
const matchingRoutes = require('../routes/volunteerMatchingRoutes');
//const { profiles } = require('../data/memoryStore');
//const { events } = require('../data/memoryEvents');

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
*/
// backend/__tests__/volunteerMatchingRoutes.test.js

const request = require('supertest');

// Mock all dependencies before importing app
jest.mock('../firebase', () => {
  const mockEvents = [
    {
      id: 'event1',
      eventname: 'Beach Cleanup',
      city: 'Houston',
      state: 'TX',
      skills: ['environmental', 'physical'],
      urgency: '3',
      availability: ['2025-12-01', '2025-12-02']
    },
    {
      id: 'event2', 
      eventname: 'Food Drive',
      city: 'Austin',
      state: 'TX', 
      skills: ['organization', 'communication'],
      urgency: '2',
      availability: ['2024-01-01'] // Past date
    }
  ];

  const mockVolunteers = [
    {
      uid: 'vol1',
      name: 'John Doe',
      city: 'Houston',
      state: 'TX',
      role: 'volunteer',
      skills: ['environmental', 'communication'],
      availability: ['2025-12-01'],
      history: []
    },
    {
      uid: 'vol2', 
      name: 'Jane Smith',
      city: 'Austin',
      state: 'TX',
      role: 'volunteer', 
      skills: ['organization'],
      availability: ['2025-12-02'],
      history: []
    }
  ];

  const mockMatches = [
    {
      id: 'match1',
      volunteerId: 'vol1',
      eventId: 'event1',
      volunteerName: 'John Doe',
      eventName: 'Beach Cleanup',
      matchedSkills: ['environmental'],
      createdAt: '2025-01-01T00:00:00.000Z',
      matchStatus: 'active'
    }
  ];

  let shouldFirebaseSucceed = true;
  let mockDocExists = true;
  let mockCollectionEmpty = false;

  const createMockCollection = (collectionName) => {
    let data;
    switch(collectionName) {
      case 'events': data = [...mockEvents]; break;
      case 'users': data = [...mockVolunteers]; break; 
      case 'matches': data = [...mockMatches]; break;
      default: data = [];
    }

    return {
      get: jest.fn(() => {
        if (!shouldFirebaseSucceed) {
          return Promise.reject(new Error(`Firebase error for ${collectionName}`));
        }
        return Promise.resolve({
          docs: mockCollectionEmpty ? [] : data.map(item => ({
            id: item.id || item.uid,
            data: () => ({ ...item })
          })),
          forEach: (cb) => {
            if (!mockCollectionEmpty) {
              data.forEach(item => cb({ 
                id: item.id || item.uid, 
                data: () => ({ ...item })
              }));
            }
          },
          empty: mockCollectionEmpty,
          size: mockCollectionEmpty ? 0 : data.length
        });
      }),
      
      doc: jest.fn((docId) => ({
        get: jest.fn(() => {
          if (!shouldFirebaseSucceed) {
            return Promise.reject(new Error('Firebase doc error'));
          }
          const item = data.find(d => (d.id || d.uid) === docId);
          return Promise.resolve({
            exists: mockDocExists && !!item,
            id: docId,
            data: () => item ? { ...item } : null
          });
        }),
        delete: jest.fn(() => {
          if (!shouldFirebaseSucceed) {
            return Promise.reject(new Error('Firebase delete error'));
          }
          return Promise.resolve();
        }),
        update: jest.fn(() => {
          if (!shouldFirebaseSucceed) {
            return Promise.reject(new Error('Firebase update error'));
          }
          return Promise.resolve();
        })
      })),
      
      where: jest.fn((field, operator, value) => ({
        get: jest.fn(() => {
          if (!shouldFirebaseSucceed) {
            return Promise.reject(new Error('Firebase where error'));
          }
          let filtered = data.filter(item => {
            if (field === 'role') return item.role === value;
            if (field === 'eventId') return item.eventId === value;
            if (field === 'volunteerId' && operator === '==') return item.volunteerId === value;
            return true;
          });
          return Promise.resolve({
            docs: filtered.map(item => ({
              id: item.id || item.uid,
              data: () => ({ ...item })
            })),
            empty: filtered.length === 0,
            size: filtered.length
          });
        }),
        where: jest.fn((field2, operator2, value2) => ({
          limit: jest.fn(() => ({
            get: jest.fn(() => {
              if (!shouldFirebaseSucceed) {
                return Promise.reject(new Error('Firebase complex query error'));
              }
              let filtered = data.filter(item => {
                let match1 = false, match2 = false;
                if (field === 'volunteerId') match1 = item.volunteerId === value;
                if (field2 === 'eventId') match2 = item.eventId === value2;
                return match1 && match2;
              });
              return Promise.resolve({
                empty: filtered.length === 0,
                docs: filtered.map(item => ({
                  id: item.id,
                  data: () => ({ ...item })
                }))
              });
            })
          }))
        }))
      })),
      
      add: jest.fn((data) => {
        if (!shouldFirebaseSucceed) {
          return Promise.reject(new Error('Firebase add error'));
        }
        const newId = `new-${Date.now()}`;
        return Promise.resolve({ id: newId });
      })
    };
  };

  return {
    db: {
      collection: jest.fn((name) => createMockCollection(name))
    },
    __mockControls: {
      setFirebaseSuccess: (success) => { shouldFirebaseSucceed = success; },
      setDocExists: (exists) => { mockDocExists = exists; },
      setCollectionEmpty: (empty) => { mockCollectionEmpty = empty; },
      resetMocks: () => {
        shouldFirebaseSucceed = true;
        mockDocExists = true;
        mockCollectionEmpty = false;
        // Reset mock data arrays
        mockEvents.length = 0;
        mockEvents.push(
          {
            id: 'event1',
            eventname: 'Beach Cleanup',
            city: 'Houston',
            state: 'TX',
            skills: ['environmental', 'physical'],
            urgency: '3',
            availability: ['2025-12-01', '2025-12-02']
          },
          {
            id: 'event2', 
            eventname: 'Food Drive',
            city: 'Austin',
            state: 'TX', 
            skills: ['organization', 'communication'],
            urgency: '2',
            availability: ['2024-01-01']
          }
        );
        mockVolunteers.length = 0;
        mockVolunteers.push(
          {
            uid: 'vol1',
            name: 'John Doe',
            city: 'Houston',
            state: 'TX',
            role: 'volunteer',
            skills: ['environmental', 'communication'],
            availability: ['2025-12-01'],
            history: []
          },
          {
            uid: 'vol2', 
            name: 'Jane Smith',
            city: 'Austin',
            state: 'TX',
            role: 'volunteer', 
            skills: ['organization'],
            availability: ['2025-12-02'],
            history: []
          }
        );
        mockMatches.length = 0;
        mockMatches.push({
          id: 'match1',
          volunteerId: 'vol1',
          eventId: 'event1',
          volunteerName: 'John Doe',
          eventName: 'Beach Cleanup',
          matchedSkills: ['environmental'],
          createdAt: '2025-01-01T00:00:00.000Z',
          matchStatus: 'active'
        });
        jest.clearAllMocks();
      }
    },
    __mockData: { mockEvents, mockVolunteers, mockMatches }
  };
});

jest.mock('../utils/notificationService', () => ({
  sendNotification: jest.fn().mockResolvedValue(true)
}));

jest.mock('../utils/notificationAggregator', () => jest.fn());

jest.mock('firebase-admin', () => ({
  firestore: {
    FieldValue: {
      arrayUnion: jest.fn((data) => ({ arrayUnion: data }))
    }
  }
}));

// Import app after mocks
const app = require('../index');
const { __mockControls, __mockData } = require('../firebase');
const notificationService = require('../utils/notificationService');

describe('Volunteer Matching Routes - 80%+ Coverage', () => {
  
  beforeEach(() => {
    __mockControls.resetMocks();
    jest.clearAllMocks();
  });

  describe('GET /api/matching/events - Branch Coverage', () => {
    it('should return filtered and sorted events successfully', async () => {
      __mockControls.setFirebaseSuccess(true);
      
      const res = await request(app).get('/api/matching/events');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      
      // Should filter out past events and include future ones
      expect(res.body.data.length).toBe(1); // Only event1 should remain
      expect(res.body.data[0].name).toBe('Beach Cleanup');
      expect(res.body.data[0]).toHaveProperty('urgencyName');
    });

    it('should handle events with no availability array', async () => {
      // Add event without availability to mock data
      __mockData.mockEvents.push({
        id: 'event3',
        eventname: 'No Availability Event', 
        city: 'Dallas',
        urgency: '1'
      });
      
      const res = await request(app).get('/api/matching/events');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      
      // Should include event without availability
      const noAvailEvent = res.body.data.find(e => e.name === 'No Availability Event');
      expect(noAvailEvent).toBeDefined();
      expect(noAvailEvent.date).toBe('TBD');
    });

    it('should handle events with empty availability array', async () => {
      __mockData.mockEvents[0].availability = [];
      
      const res = await request(app).get('/api/matching/events');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      // Event with empty availability should be included
    });

    it('should handle Firebase error', async () => {
      __mockControls.setFirebaseSuccess(false);
      
      const res = await request(app).get('/api/matching/events');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to fetch events');
    });

    it('should sort events by urgency correctly', async () => {
      // Reset and add multiple events with different urgencies
      __mockData.mockEvents.length = 0;
      __mockData.mockEvents.push(
        { id: 'e1', eventname: 'Low', urgency: '1', availability: ['2025-12-01'] },
        { id: 'e2', eventname: 'Critical', urgency: '4', availability: ['2025-12-01'] },
        { id: 'e3', eventname: 'High', urgency: '3', availability: ['2025-12-01'] }
      );
      
      const res = await request(app).get('/api/matching/events');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.data[0].name).toBe('Critical'); // Highest urgency first
      expect(res.body.data[1].name).toBe('High');
      expect(res.body.data[2].name).toBe('Low');
    });
  });

  describe('GET /api/matching/volunteers/:eventId - Branch Coverage', () => {
    it('should return matching volunteers successfully', async () => {
      __mockControls.setFirebaseSuccess(true);
      
      const res = await request(app).get('/api/matching/volunteers/event1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.volunteers).toBeDefined();
      expect(res.body.data.eventDetails).toBeDefined();
    });

    it('should return 404 when event not found', async () => {
      __mockControls.setDocExists(false);
      
      const res = await request(app).get('/api/matching/volunteers/nonexistent');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Event not found');
    });

    it('should handle Firebase error', async () => {
      __mockControls.setFirebaseSuccess(false);
      
      const res = await request(app).get('/api/matching/volunteers/event1');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to fetch matching volunteers');
    });
  });

  describe('POST /api/matching/matches - Branch Coverage', () => {
    it('should create match successfully', async () => {
      __mockControls.setFirebaseSuccess(true);
      __mockControls.setCollectionEmpty(true); // No existing matches
      
      const res = await request(app)
        .post('/api/matching/matches')
        .send({
          volunteerId: 'vol2',
          eventId: 'event2' // Match Jane from Austin with Austin event
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Match created successfully');
      expect(res.body.data.id).toBeDefined();
      expect(notificationService.sendNotification).toHaveBeenCalled();
    });

    it('should return 400 when volunteerId missing', async () => {
      const res = await request(app)
        .post('/api/matching/matches')
        .send({
          eventId: 'event1'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Both volunteerId and eventId are required');
    });

    it('should return 400 when eventId missing', async () => {
      const res = await request(app)
        .post('/api/matching/matches')
        .send({
          volunteerId: 'vol1'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Both volunteerId and eventId are required');
    });

    it('should return 409 when match already exists', async () => {
      __mockControls.setFirebaseSuccess(true);
      __mockControls.setCollectionEmpty(false); // Existing matches found
      
      const res = await request(app)
        .post('/api/matching/matches')
        .send({
          volunteerId: 'vol1',
          eventId: 'event1'
        });
      
      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('This volunteer is already matched to this event');
    });

    it('should handle Firebase error during match creation', async () => {
      __mockControls.setFirebaseSuccess(false);
      
      const res = await request(app)
        .post('/api/matching/matches')
        .send({
          volunteerId: 'vol1',
          eventId: 'event1'
        });
      
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to create match');
    });
  });

  describe('GET /api/matching/matches - Branch Coverage', () => {
    it('should return all matches successfully', async () => {
      __mockControls.setFirebaseSuccess(true);
      
      const res = await request(app).get('/api/matching/matches');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should handle Firebase error', async () => {
      __mockControls.setFirebaseSuccess(false);
      
      const res = await request(app).get('/api/matching/matches');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to fetch matches');
    });
  });

  describe('DELETE /api/matching/matches/:matchId - Branch Coverage', () => {
    it('should delete match successfully', async () => {
      __mockControls.setFirebaseSuccess(true);
      
      const res = await request(app).delete('/api/matching/matches/match1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Match deleted successfully');
    });

    it('should return 404 when match not found', async () => {
      __mockControls.setDocExists(false);
      
      const res = await request(app).delete('/api/matching/matches/nonexistent');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Match not found');
    });

    it('should handle Firebase error during deletion', async () => {
      __mockControls.setFirebaseSuccess(false);
      
      const res = await request(app).delete('/api/matching/matches/match1');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to delete match');
    });
  });

  describe('GET /api/matching/volunteer-history/:volunteerId - Branch Coverage', () => {
    it('should return volunteer history successfully', async () => {
      __mockControls.setFirebaseSuccess(true);
      // Add history to volunteer
      __mockData.mockVolunteers[0].history = [
        {
          eid: 'event1',
          eventname: 'Test Event',
          participationStatus: 'Confirmed'
        }
      ];
      
      const res = await request(app).get('/api/matching/volunteer-history/vol1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should return 404 when volunteer not found', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      __mockControls.setDocExists(false);
      
      const res = await request(app).get('/api/matching/volunteer-history/nonexistent');
      
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Volunteer not found');
    });

    it('should handle volunteer with no history', async () => {
      __mockData.mockVolunteers[0].history = [];
      
      const res = await request(app).get('/api/matching/volunteer-history/vol1');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    it('should handle Firebase error', async () => {
      __mockControls.setFirebaseSuccess(false);
      
      const res = await request(app).get('/api/matching/volunteer-history/vol1');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to fetch event history');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty collections gracefully', async () => {
      __mockControls.setCollectionEmpty(true);
      
      const res = await request(app).get('/api/matching/events');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    it('should handle malformed data gracefully', async () => {
      // Add malformed event
      __mockData.mockEvents.push({
        id: 'malformed',
        // Missing required fields
      });
      
      const res = await request(app).get('/api/matching/events');
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      // Should handle malformed data without crashing
    });
  });
});


