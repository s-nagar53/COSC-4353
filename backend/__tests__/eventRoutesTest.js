const request = require('supertest');
const express = require('express');
const eventRoutes = require('./eventRoutes'); // Adjust path as needed

// Mock dependencies
jest.mock('../data/memoryEvents', () => ({
  events: {
    event: []
  }
}));

jest.mock('../utils/validateEvent', () => ({
  validateEvent: jest.fn()
}));

const { events } = require('../data/memoryEvents');
const { validateEvent } = require('../utils/validateEvent');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/events', eventRoutes);

// Mock console methods to avoid cluttering test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  // Reset mocks and data before each test
  jest.clearAllMocks();
  events.event = [];
  
  // Mock console methods
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});

describe('Event Routes', () => {
  describe('GET /events/all', () => {
    test('should return all events successfully', async () => {
      const mockEvents = [
        { eid: 'event1', eventname: 'Test Event 1' },
        { eid: 'event2', eventname: 'Test Event 2' }
      ];
      events.event = mockEvents;

      const response = await request(app)
        .get('/events/all')
        .expect(200);

      expect(response.body).toEqual({ events: mockEvents });
      expect(console.log).toHaveBeenCalledWith('📋 Fetching all events, found:', 2);
    });

    test('should return empty array when no events exist', async () => {
      events.event = [];

      const response = await request(app)
        .get('/events/all')
        .expect(200);

      expect(response.body).toEqual({ events: [] });
      expect(console.log).toHaveBeenCalledWith('📋 Fetching all events, found:', 0);
    });

    test('should handle errors and return 500', async () => {
      // Mock an error by making events.event throw
      Object.defineProperty(events, 'event', {
        get: () => {
          throw new Error('Database error');
        }
      });

      const response = await request(app)
        .get('/events/all')
        .expect(500);

      expect(response.body).toEqual({ message: 'Failed to fetch events' });
      expect(console.error).toHaveBeenCalledWith('Error fetching all events:', expect.any(Error));
    });
  });

  describe('POST /events', () => {
    const validEventData = {
      eid: 'event123',
      uid: 'user456',
      role: 'volunteer',
      eventname: 'Test Event',
      address: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zip: '12345',
      urgency: 'medium',
      skills: ['cleaning'],
      availability: ['2024-01-15T10:00:00Z', '2024-01-16T10:00:00Z']
    };

    test('should create new event successfully', async () => {
      validateEvent.mockReturnValue([]);

      const response = await request(app)
        .post('/events')
        .send(validEventData)
        .expect(200);

      expect(response.body).toEqual({ message: 'Event saved successfully' });
      expect(events.event).toHaveLength(1);
      expect(events.event[0]).toMatchObject({
        eid: 'event123',
        uid: 'user456',
        role: 'volunteer',
        eventname: 'Test Event',
        id: 'event123',
        availability: ['2024-01-15', '2024-01-16']
      });
    });

    test('should return 400 when eid is missing', async () => {
      const dataWithoutEid = { ...validEventData };
      delete dataWithoutEid.eid;

      const response = await request(app)
        .post('/events')
        .send(dataWithoutEid)
        .expect(400);

      expect(response.body).toEqual({ message: 'Missing Event ID (eid)' });
      expect(validateEvent).not.toHaveBeenCalled();
    });

    test('should return 400 when validation fails', async () => {
      const validationErrors = ['Missing event name', 'Invalid zip code'];
      validateEvent.mockReturnValue(validationErrors);

      const response = await request(app)
        .post('/events')
        .send(validEventData)
        .expect(400);

      expect(response.body).toEqual({
        message: 'Validation errors',
        errors: validationErrors
      });
      expect(events.event).toHaveLength(0);
    });

    test('should update existing event with same eid', async () => {
      validateEvent.mockReturnValue([]);
      
      // Add an existing event
      events.event = [{ eid: 'event123', eventname: 'Old Event' }];

      const response = await request(app)
        .post('/events')
        .send(validEventData)
        .expect(200);

      expect(response.body).toEqual({ message: 'Event saved successfully' });
      expect(events.event).toHaveLength(1);
      expect(events.event[0].eventname).toBe('Test Event');
    });

    test('should handle empty availability array', async () => {
      validateEvent.mockReturnValue([]);
      const dataWithEmptyAvailability = {
        ...validEventData,
        availability: []
      };

      const response = await request(app)
        .post('/events')
        .send(dataWithEmptyAvailability)
        .expect(200);

      expect(events.event[0].availability).toEqual([]);
    });

    test('should handle missing availability field', async () => {
      validateEvent.mockReturnValue([]);
      const dataWithoutAvailability = { ...validEventData };
      delete dataWithoutAvailability.availability;

      const response = await request(app)
        .post('/events')
        .send(dataWithoutAvailability)
        .expect(200);

      expect(events.event[0].availability).toEqual([]);
    });

    test('should call validateEvent with correct parameters', async () => {
      validateEvent.mockReturnValue([]);

      await request(app)
        .post('/events')
        .send(validEventData)
        .expect(200);

      expect(validateEvent).toHaveBeenCalledWith({
        eid: 'event123',
        uid: 'user456',
        eventname: 'Test Event',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zip: '12345',
        urgency: 'medium',
        skills: ['cleaning'],
        availability: ['2024-01-15T10:00:00Z', '2024-01-16T10:00:00Z']
      }, 'volunteer');
    });
  });

  describe('GET /events/:eid', () => {
    test('should return event when found', async () => {
      const mockEvent = { eid: 'event123', eventname: 'Test Event' };
      events.event = [mockEvent];

      const response = await request(app)
        .get('/events/event123')
        .expect(200);

      expect(response.body).toEqual(mockEvent);
      expect(console.log).toHaveBeenCalledWith('📋 Looking for event with eid:', 'event123');
    });

    test('should return 404 when event not found', async () => {
      events.event = [];

      const response = await request(app)
        .get('/events/nonexistent')
        .expect(404);

      expect(response.body).toEqual({ message: 'Event not found' });
      expect(console.log).toHaveBeenCalledWith('📋 Looking for event with eid:', 'nonexistent');
    });

    test('should find correct event among multiple events', async () => {
      const mockEvents = [
        { eid: 'event1', eventname: 'Event 1' },
        { eid: 'event2', eventname: 'Event 2' },
        { eid: 'event3', eventname: 'Event 3' }
      ];
      events.event = mockEvents;

      const response = await request(app)
        .get('/events/event2')
        .expect(200);

      expect(response.body).toEqual(mockEvents[1]);
    });
  });

  describe('DELETE /events/:eid', () => {
    test('should delete event successfully', async () => {
      events.event = [
        { eid: 'event1', eventname: 'Event 1' },
        { eid: 'event2', eventname: 'Event 2' }
      ];

      const response = await request(app)
        .delete('/events/event1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Event deleted successfully' });
      expect(events.event).toHaveLength(1);
      expect(events.event[0].eid).toBe('event2');
      expect(console.log).toHaveBeenCalledWith('✅ Event deleted:', 'event1');
    });

    test('should return 404 when event to delete not found', async () => {
      events.event = [{ eid: 'event1', eventname: 'Event 1' }];

      const response = await request(app)
        .delete('/events/nonexistent')
        .expect(404);

      expect(response.body).toEqual({ message: 'Event not found' });
      expect(events.event).toHaveLength(1); // Original event still exists
      expect(console.log).toHaveBeenCalledWith('❌ Event not found for deletion:', 'nonexistent');
    });

    test('should handle empty events array', async () => {
      events.event = [];

      const response = await request(app)
        .delete('/events/event1')
        .expect(404);

      expect(response.body).toEqual({ message: 'Event not found' });
      expect(events.event).toHaveLength(0);
    });

    test('should delete only the specified event', async () => {
      events.event = [
        { eid: 'event1', eventname: 'Event 1' },
        { eid: 'event2', eventname: 'Event 2' },
        { eid: 'event3', eventname: 'Event 3' }
      ];

      const response = await request(app)
        .delete('/events/event2')
        .expect(200);

      expect(events.event).toHaveLength(2);
      expect(events.event.find(e => e.eid === 'event2')).toBeUndefined();
      expect(events.event.find(e => e.eid === 'event1')).toBeDefined();
      expect(events.event.find(e => e.eid === 'event3')).toBeDefined();
    });
  });
});