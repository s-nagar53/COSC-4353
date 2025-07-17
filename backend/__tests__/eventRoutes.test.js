const request = require('supertest');
const express = require('express');
const eventRoutes = require('../routes/eventRoutes');
const { events } = require('../data/memoryEvents');

// 🔧 Setup a fresh app instance with only event routes
const app = express();
app.use(express.json());
app.use('/api/event', eventRoutes);

beforeEach(() => {
  events.event = []; // reset in-memory data before each test
});

describe('GET /api/event/all', () => {
  it('should return an empty event list', async () => {
    const res = await request(app).get('/api/event/all');
    expect(res.statusCode).toBe(200);
    expect(res.body.events).toEqual([]);
  });

  it('should return a list of events', async () => {
    events.event.push({ eid: 'ev123', eventname: 'Test Event' });
    const res = await request(app).get('/api/event/all');
    expect(res.statusCode).toBe(200);
    expect(res.body.events[0].eid).toBe('ev123');
  });
});

describe('POST /api/event', () => {
 const validEvent = {
  eid: 'ev123',
  uid: 'u1',
  role: 'admin', // optional, not validated here
  eventname: 'Test Event',
  address: '123 Main St',
  city: 'Houston',
  state: 'TX',
  zip: '77001',
  urgency: 'Medium',
  skills: ['Setup'],
  availability: ['2025-07-20'], // optional, used in backend
};

  it('should create a valid event', async () => {
    const res = await request(app).post('/api/event').send(validEvent);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Event saved successfully');
    expect(events.event.length).toBe(1);
  });

  it('should return 400 for missing eid', async () => {
    const { eid, ...invalid } = validEvent;
    const res = await request(app).post('/api/event').send(invalid);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Missing Event ID/);
  });

  it('should return validation errors if fields are missing', async () => {
    const res = await request(app)
      .post('/api/event')
      .send({ eid: 'bad', role: 'admin' }); // incomplete
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
  });
});

describe('GET /api/event/:eid', () => {
  it('should return the event by eid', async () => {
    events.event.push({ eid: 'ev123', eventname: 'One Event' });
    const res = await request(app).get('/api/event/ev123');
    expect(res.statusCode).toBe(200);
    expect(res.body.eventname).toBe('One Event');
  });

  it('should return 404 for unknown eid', async () => {
    const res = await request(app).get('/api/event/not-there');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Event not found');
  });
});

describe('DELETE /api/event/:eid', () => {
  it('should delete the event by eid', async () => {
    events.event.push({ eid: 'ev123', eventname: 'One Event' });
    const res = await request(app).delete('/api/event/ev123');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Event deleted successfully');
    expect(events.event.length).toBe(0);
  });

  it('should return 404 if event not found', async () => {
    const res = await request(app).delete('/api/event/missing');
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('Event not found');
  });
});
