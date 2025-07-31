jest.mock('../firebase');
const request = require('supertest');
const app = require('../index'); // Ensure your Express app is exported
const { db } = require('../firebase'); // ✅ this fixes the ReferenceError

const { __mockData } = require('../firebase');

beforeEach(() => {
  __mockData.mockEvents.length = 0;
  __mockData.mockEvents.push(
    {
      eid: 'e1',
      title: 'Food Drive',
      date: '2025-08-01',
      location: 'Houston',
      description: 'Community food collection'
    },
    {
      eid: 'e2',
      title: 'Beach Cleanup',
      date: '2025-08-15',
      location: 'Galveston',
      description: 'Environmental cleanup event'
    }
  );
});

describe('Event Routes', () => {
  it('GET /api/event/all - should return all events', async () => {
  const res = await request(app).get('/api/event/all'); // ✅ corrected path
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body.events)).toBe(true);
  expect(res.body.events.length).toBe(2);
});


  it('GET /api/event/e1 - should return the event with eid e1', async () => {
    const res = await request(app).get('/api/event/e1'); // FIXED PATH
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Food Drive');
  });

  it('GET /api/event/invalid - should return 404 if event not found', async () => {
    const res = await request(app).get('/api/event/invalid'); // FIXED PATH
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Event not found');
  });
});

it('POST /api/event - creates a new event', async () => {
  const res = await request(app).post('/api/event').send({
    eid: 'e3',
    uid: 'u1',
    role: 'coordinator',
    eventname: 'Tree Planting',
    address: '123 Green St',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    urgency: 'High',
    availability: ['2025-12-01'],
    skills: ['gardening', 'coordination']
  });

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe('Event saved successfully');
});


it('POST /api/event - missing eid returns 400', async () => {
  const res = await request(app).post('/api/event').send({
    uid: 'u1',
    role: 'coordinator',
    eventname: 'Invalid Event'
  });
  expect(res.statusCode).toBe(400);
});

it('DELETE /api/event/invalid - returns 404 if event not found', async () => {
  const res = await request(app).delete('/api/event/invalid');
  expect(res.statusCode).toBe(404);
});

it('DELETE /api/event/e1 - deletes an event successfully', async () => {
  const res = await request(app).delete('/api/event/e1');
  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe('Event deleted successfully');
});

it('POST /api/event - returns 400 if eid is missing', async () => {
  const res = await request(app).post('/api/event').send({
    uid: 'u1',
    city: 'Austin',
  });
  expect(res.statusCode).toBe(400);
  expect(res.body.message).toBe('Missing Event ID (eid)');
});

it('DELETE /api/event/invalid - returns 404 if event not found', async () => {
  const res = await request(app).delete('/api/event/invalid');
  expect(res.statusCode).toBe(404);
  expect(res.body.message).toBe('Event not found');
});

/*
it('POST /api/event - returns 500 if Firestore throws during save', async () => {
  const { db } = require('../firebase');

  // Backup original collection method
  const originalCollection = db.collection;

  // Mock the Firestore behavior to throw inside .set()
  db.collection = jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({ exists: false }), // pretend doc doesn't exist
      set: jest.fn().mockRejectedValue(new Error('Simulated Firestore failure'))
    }))
  }));

  const res = await request(app).post('/api/event').send({
    eid: 'e500',
    uid: 'u500',
    eventname: 'Fails to Save',
    address: '123 Test Ave',
    city: 'Nowhere',
    state: 'TX',
    zip: '12345',
    urgency: 'low',
    skills: ['setup'],
    availability: ['2025-08-01']
  });

  expect(res.statusCode).toBe(500);
  expect(res.body.message).toBe('Failed to save event');

  // Restore
  db.collection = originalCollection;
});
*/
