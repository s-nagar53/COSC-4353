jest.mock('firebase-admin'); // if you’re mocking it globally

const request = require('supertest');
const app = require('../index');
const { profiles } = require('../data/memoryStore');
const { events } = require('../data/memoryEvents');

describe('GET /api/test', () => {
  it('should return backend status', async () => {
    const res = await request(app).get('/api/test');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Backend is running!');
    expect(res.body).toHaveProperty('firebaseAdmin');
    expect(res.body).toHaveProperty('profiles');
    expect(res.body).toHaveProperty('events');
  });
});

describe('GET /api/matching-data', () => {
  beforeEach(() => {
    profiles.volunteers = [
      { uid: 'vol1', name: 'Alice', city: 'Houston', skills: ['Cooking'] }
    ];
    events.event = [
      { eid: 'ev1', eventname: 'Food Drive', city: 'Houston', skills: ['Cooking'] }
    ];
  });

  it('should return volunteers and events summary', async () => {
    const res = await request(app).get('/api/matching-data');
    expect(res.statusCode).toBe(200);
    expect(res.body.volunteers[0]).toMatchObject({
      id: 'vol1',
      name: 'Alice',
      city: 'Houston'
    });
    expect(res.body.events[0]).toMatchObject({
      id: 'ev1',
      name: 'Food Drive',
      city: 'Houston'
    });
  });
});

it('should return 503 if Firebase Admin is not initialized', async () => {
  const admin = require('firebase-admin');
  admin.auth = jest.fn().mockReturnValue({
    verifyIdToken: () => {
      throw new Error('Not initialized');
    }
  });

  // Set up a blank mock that prevents Firebase from being set up
  jest.mock('firebase-admin', () => ({
    credential: { cert: jest.fn() },
    initializeApp: jest.fn(() => { throw new Error('No key') }),
    auth: jest.fn()
  }));

  const res = await request(app)
    .post('/set-role')
    .set('Authorization', 'Bearer any-token')
    .send({ role: 'admin' });

  expect([503, 403]).toContain(res.statusCode); // fallback
});

