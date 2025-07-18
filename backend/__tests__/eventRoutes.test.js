jest.mock('../utils/notificationService', () => ({
  sendNotification: jest.fn()
}));

const request = require('supertest');
const express = require('express');
const eventRoutes = require('../routes/eventRoutes');
const { events } = require('../data/memoryEvents');
const notificationService = require('../utils/notificationService');
const { matches } = require('../data/memoryMatches');


// 🔧 Setup a fresh app instance with only event routes
const app = express();
app.use(express.json());
app.use('/api/event', eventRoutes);
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

it('should handle event creation with no availability field', async () => {
  const noAvailability = { ...validEvent };
  delete noAvailability.availability;

  const res = await request(app).post('/api/event').send(noAvailability);
  expect(res.statusCode).toBe(200);
  expect(events.event[0].availability).toEqual([]);
});

it('should return all added events', async () => {
  events.event.push({ eid: 'ev1', eventname: 'Event 1' });
  events.event.push({ eid: 'ev2', eventname: 'Event 2' });

  const res = await request(app).get('/api/event/all');
  expect(res.statusCode).toBe(200);
  expect(res.body.events.length).toBe(2);
  expect(res.body.events.map(e => e.eid)).toEqual(expect.arrayContaining(['ev1', 'ev2']));
});
it('should update an existing event with the same eid instead of adding a duplicate', async () => {
  await request(app).post('/api/event').send(validEvent);

  const updated = { ...validEvent, eventname: 'Updated Event' };
  const res = await request(app).post('/api/event').send(updated);

  expect(res.statusCode).toBe(200);
  expect(events.event.length).toBe(1); // Still one event
  expect(events.event[0].eventname).toBe('Updated Event');
});

it('should normalize availability dates to YYYY-MM-DD format', async () => {
  const res = await request(app).post('/api/event').send({
    ...validEvent,
    availability: ['2025-07-20T15:30:00.000Z']
  });
  expect(res.statusCode).toBe(200);
  expect(events.event[0].availability[0]).toBe('2025-07-20');
});

it('should return 500 if fetching events throws an error', async () => {
  // Save original reference
  const originalEvents = events.event;

  // Replace with a getter that throws
  Object.defineProperty(events, 'event', {
    get() {
      throw new Error('Simulated fetch error');
    },
    configurable: true
  });

  const res = await request(app).get('/api/event/all');
  expect(res.statusCode).toBe(500);
  expect(res.body.message).toBe('Failed to fetch events');

  // Restore original reference
  Object.defineProperty(events, 'event', {
    value: originalEvents,
    writable: true,
    configurable: true,
  });
});

it('should send notifications to matched volunteers when event is updated', async () => {
  // Setup a matching volunteer
  matches.length = 0; // Clear previous data
  matches.push({
    eventId: 'ev123',
    volunteerId: 'vol1'
  });

  await request(app).post('/api/event').send(validEvent);

  expect(notificationService.sendNotification).toHaveBeenCalledWith(
    'vol1',
    expect.objectContaining({
      type: 'event_update',
      message: expect.stringContaining("Test Event"),
      data: expect.objectContaining({
        eventId: 'ev123',
        eventName: 'Test Event'
      })
    })
  );
});
