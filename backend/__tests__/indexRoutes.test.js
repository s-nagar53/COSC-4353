jest.mock('../firebase'); // ✅ Use the real __mocks__/firebase.js
const { __mockData } = require('../__mocks__/firebase'); // use mock DB store

const request = require('supertest');
const app = require('../index');
//const { profiles } = require('../data/memoryStore');
//const { events } = require('../data/memoryEvents');



describe('GET /api/test', () => {
  it('should return backend status', async () => {
    const res = await request(app).get('/api/test');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Backend is running!');
    expect(res.body).toHaveProperty('firebaseAdmin');
    // No longer expecting 'profiles' or 'events'
  });
});

/*
describe('GET /api/matching-data', () => {
  beforeEach(() => {
    // ✅ Clear previous mockDataStore entries (like 'u1')
    Object.keys(__mockData.mockDataStore).forEach(k => delete __mockData.mockDataStore[k]);

    // ✅ Set up fresh test data
    __mockData.mockDataStore['vol1'] = {
      uid: 'vol1',
      name: 'Alice',
      role: 'volunteer',
      city: 'Houston',
      skills: ['Cooking'],
      history: []
    };

    __mockData.mockEvents.length = 0;
    __mockData.mockEvents.push({
      eid: 'ev1',
      eventname: 'Food Drive',
      city: 'Houston',
      skills: ['Cooking']
    });

    __mockData.mockMatches.length = 0;
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
*/


describe('POST /set-role', () => {
  it('should return 503 or 403 if Firebase Admin fails', async () => {
    const admin = require('firebase-admin');
    admin.auth = jest.fn().mockReturnValue({
      verifyIdToken: () => {
        throw new Error('Not initialized');
      }
    });

    const res = await request(app)
      .post('/set-role')
      .set('Authorization', 'Bearer any-token')
      .send({ role: 'admin' });

    expect([503, 403]).toContain(res.statusCode);
  });
});

describe('POST /set-role', () => {
  it('should return 400 if ID token is missing', async () => {
    const res = await request(app)
      .post('/set-role')
      .send({ role: 'admin' }); // No Authorization header

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Missing ID token or role');
  });

  it('should return 400 if role is missing', async () => {
    const res = await request(app)
      .post('/set-role')
      .set('Authorization', 'Bearer mock-token') // Missing role in body
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Missing ID token or role');
  });


  it('should return 403 if Firebase token verification fails', async () => {
    const { admin } = require('../firebase');
    admin.auth().verifyIdToken = jest.fn(() => {
      throw new Error('Invalid token');
    });

    const res = await request(app)
      .post('/set-role')
      .set('Authorization', 'Bearer bad-token')
      .send({ role: 'admin' });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/Forbidden/);
  });
});
