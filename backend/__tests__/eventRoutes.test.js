// jest.mock('../firebase');
// const request = require('supertest');
// const app = require('../index'); // Ensure your Express app is exported
// const { db } = require('../firebase'); // ✅ this fixes the ReferenceError

// const { __mockData } = require('../firebase');

// beforeEach(() => {
//   __mockData.mockEvents.length = 0;
//   __mockData.mockEvents.push(
//     {
//       eid: 'e1',
//       title: 'Food Drive',
//       date: '2025-08-01',
//       location: 'Houston',
//       description: 'Community food collection'
//     },
//     {
//       eid: 'e2',
//       title: 'Beach Cleanup',
//       date: '2025-08-15',
//       location: 'Galveston',
//       description: 'Environmental cleanup event'
//     }
//   );
// });

// describe('Event Routes', () => {
//   it('GET /api/event/all - should return all events', async () => {
//   const res = await request(app).get('/api/event/all'); // ✅ corrected path
//   expect(res.statusCode).toBe(200);
//   expect(Array.isArray(res.body.events)).toBe(true);
//   expect(res.body.events.length).toBe(2);
// });


//   it('GET /api/event/e1 - should return the event with eid e1', async () => {
//     const res = await request(app).get('/api/event/e1'); // FIXED PATH
//     expect(res.statusCode).toBe(200);
//     expect(res.body.title).toBe('Food Drive');
//   });

//   it('GET /api/event/invalid - should return 404 if event not found', async () => {
//     const res = await request(app).get('/api/event/invalid'); // FIXED PATH
//     expect(res.statusCode).toBe(404);
//     expect(res.body.message).toBe('Event not found');
//   });
// });

// it('POST /api/event - creates a new event', async () => {
//   const res = await request(app).post('/api/event').send({
//     eid: 'e3',
//     uid: 'u1',
//     role: 'coordinator',
//     eventname: 'Tree Planting',
//     address: '123 Green St',
//     city: 'Austin',
//     state: 'TX',
//     zip: '78701',
//     urgency: 'High',
//     availability: ['2025-12-01'],
//     skills: ['gardening', 'coordination']
//   });

//   expect(res.statusCode).toBe(200);
//   expect(res.body.message).toBe('Event saved successfully');
// });


// it('POST /api/event - missing eid returns 400', async () => {
//   const res = await request(app).post('/api/event').send({
//     uid: 'u1',
//     role: 'coordinator',
//     eventname: 'Invalid Event'
//   });
//   expect(res.statusCode).toBe(400);
// });

// it('DELETE /api/event/invalid - returns 404 if event not found', async () => {
//   const res = await request(app).delete('/api/event/invalid');
//   expect(res.statusCode).toBe(404);
// });

// it('DELETE /api/event/e1 - deletes an event successfully', async () => {
//   const res = await request(app).delete('/api/event/e1');
//   expect(res.statusCode).toBe(200);
//   expect(res.body.message).toBe('Event deleted successfully');
// });

// it('POST /api/event - returns 400 if eid is missing', async () => {
//   const res = await request(app).post('/api/event').send({
//     uid: 'u1',
//     city: 'Austin',
//   });
//   expect(res.statusCode).toBe(400);
//   expect(res.body.message).toBe('Missing Event ID (eid)');
// });

// it('DELETE /api/event/invalid - returns 404 if event not found', async () => {
//   const res = await request(app).delete('/api/event/invalid');
//   expect(res.statusCode).toBe(404);
//   expect(res.body.message).toBe('Event not found');
// });

// /*
// it('POST /api/event - returns 500 if Firestore throws during save', async () => {
//   const { db } = require('../firebase');

//   // Backup original collection method
//   const originalCollection = db.collection;

//   // Mock the Firestore behavior to throw inside .set()
//   db.collection = jest.fn(() => ({
//     doc: jest.fn(() => ({
//       get: jest.fn().mockResolvedValue({ exists: false }), // pretend doc doesn't exist
//       set: jest.fn().mockRejectedValue(new Error('Simulated Firestore failure'))
//     }))
//   }));

//   const res = await request(app).post('/api/event').send({
//     eid: 'e500',
//     uid: 'u500',
//     eventname: 'Fails to Save',
//     address: '123 Test Ave',
//     city: 'Nowhere',
//     state: 'TX',
//     zip: '12345',
//     urgency: 'low',
//     skills: ['setup'],
//     availability: ['2025-08-01']
//   });

//   expect(res.statusCode).toBe(500);
//   expect(res.body.message).toBe('Failed to save event');

//   // Restore
//   db.collection = originalCollection;
// });
// */

// eventRoutes.test.js - Comprehensive Tests for Event Routes

const request = require('supertest');
const express = require('express');
const eventRoutes = require('../routes/eventRoutes');

// Mock dependencies
jest.mock('../firebase', () => ({
  db: {
    collection: jest.fn()
  }
}));

jest.mock('../utils/validateEvent', () => ({
  validateEvent: jest.fn()
}));

jest.mock('../utils/notificationService', () => ({
  sendNotification: jest.fn()
}));

const { db } = require('../firebase');
const { validateEvent } = require('../utils/validateEvent');
const notificationService = require('../utils/notificationService');

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/events', eventRoutes);

describe('Event Routes', () => {
  let mockCollection, mockDoc, mockGet, mockSet, mockUpdate, mockDelete, mockWhere;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Firestore methods
    mockGet = jest.fn();
    mockSet = jest.fn();
    mockUpdate = jest.fn();
    mockDelete = jest.fn();
    mockWhere = jest.fn();
    
    mockDoc = jest.fn(() => ({
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
      delete: mockDelete
    }));
    
    mockCollection = jest.fn(() => ({
      get: mockGet,
      doc: mockDoc,
      where: mockWhere
    }));
    
    db.collection = mockCollection;
    
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /events/all', () => {
    it('should fetch all events successfully', async () => {
      const mockEvents = [
        { id: 'event1', eventname: 'Test Event 1', city: 'Houston' },
        { id: 'event2', eventname: 'Test Event 2', city: 'Dallas' }
      ];

      const mockSnapshot = {
        forEach: jest.fn((callback) => {
          mockEvents.forEach((event, index) => {
            callback({
              id: event.id,
              data: () => ({ eventname: event.eventname, city: event.city })
            });
          });
        })
      };

      mockGet.mockResolvedValue(mockSnapshot);

      const response = await request(app)
        .get('/events/all')
        .expect(200);

      expect(response.body.events).toHaveLength(2);
      expect(response.body.events[0]).toEqual({
        id: 'event1',
        eventname: 'Test Event 1',
        city: 'Houston'
      });
      expect(mockCollection).toHaveBeenCalledWith('events');
    });

    it('should handle errors when fetching all events', async () => {
      mockGet.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/events/all')
        .expect(500);

      expect(response.body.message).toBe('Failed to fetch events');
    });

    it('should return empty array when no events exist', async () => {
      const mockSnapshot = {
        forEach: jest.fn()
      };

      mockGet.mockResolvedValue(mockSnapshot);

      const response = await request(app)
        .get('/events/all')
        .expect(200);

      expect(response.body.events).toHaveLength(0);
    });
  });

  describe('POST /events', () => {
    const validEventData = {
      eid: 'event123',
      uid: 'user123',
      role: 'organizer',
      eventname: 'Test Event',
      city: 'Houston',
      availability: ['2024-01-15T10:00:00Z', '2024-01-16T10:00:00Z']
    };

    beforeEach(() => {
      validateEvent.mockReturnValue([]);
      notificationService.sendNotification.mockResolvedValue();
    });

    it('should create a new event successfully', async () => {
      mockGet.mockResolvedValue({ exists: false });
      mockSet.mockResolvedValue();
      
      // Mock matches query for notifications
      const mockMatchesSnapshot = {
        forEach: jest.fn()
      };
      mockWhere.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockMatchesSnapshot)
      });

      const response = await request(app)
        .post('/events')
        .send(validEventData)
        .expect(200);

      expect(response.body.message).toBe('Event saved successfully');
      expect(mockDoc).toHaveBeenCalledWith('event123');
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          eid: 'event123',
          uid: 'user123',
          role: 'organizer',
          eventname: 'Test Event',
          city: 'Houston',
          availability: ['2024-01-15', '2024-01-16'],
          id: 'event123'
        })
      );
    });

    it('should update an existing event successfully', async () => {
      mockGet.mockResolvedValue({ exists: true });
      mockUpdate.mockResolvedValue();
      
      // Mock matches query for notifications
      const mockMatchesSnapshot = {
        forEach: jest.fn()
      };
      mockWhere.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockMatchesSnapshot)
      });

      const response = await request(app)
        .post('/events')
        .send(validEventData)
        .expect(200);

      expect(response.body.message).toBe('Event saved successfully');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          eid: 'event123',
          availability: ['2024-01-15', '2024-01-16']
        })
      );
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.not.objectContaining({
          createdAt: expect.anything()
        })
      );
    });

    it('should return 400 when eid is missing', async () => {
      const invalidData = { ...validEventData };
      delete invalidData.eid;

      const response = await request(app)
        .post('/events')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Missing Event ID (eid)');
    });

    it('should return 400 when validation fails', async () => {
      validateEvent.mockReturnValue(['Invalid event name', 'Invalid city']);

      const response = await request(app)
        .post('/events')
        .send(validEventData)
        .expect(400);

      expect(response.body.message).toBe('Validation errors');
      expect(response.body.errors).toEqual(['Invalid event name', 'Invalid city']);
    });

    it('should send notifications to matched volunteers on update', async () => {
      mockGet.mockResolvedValue({ exists: true });
      mockUpdate.mockResolvedValue();
      
      // Mock matches with volunteers
      const mockMatchesSnapshot = {
        forEach: jest.fn((callback) => {
          callback({
            data: () => ({ volunteerId: 'vol1', eventId: 'event123' })
          });
          callback({
            data: () => ({ volunteerId: 'vol2', eventId: 'event123' })
          });
        })
      };
      mockWhere.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockMatchesSnapshot)
      });

      await request(app)
        .post('/events')
        .send(validEventData)
        .expect(200);

      expect(notificationService.sendNotification).toHaveBeenCalledTimes(2);
      expect(notificationService.sendNotification).toHaveBeenCalledWith('vol1', {
        type: 'event_update',
        message: "Event 'Test Event' has been updated.",
        data: {
          eventId: 'event123',
          eventName: 'Test Event',
          date: '2024-01-15',
          city: 'Houston'
        }
      });
    });

    it('should handle empty availability array', async () => {
      const dataWithEmptyAvailability = {
        ...validEventData,
        availability: []
      };

      mockGet.mockResolvedValue({ exists: false });
      mockSet.mockResolvedValue();
      
      const mockMatchesSnapshot = {
        forEach: jest.fn()
      };
      mockWhere.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockMatchesSnapshot)
      });

      const response = await request(app)
        .post('/events')
        .send(dataWithEmptyAvailability)
        .expect(200);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          availability: []
        })
      );
    });

    it('should handle notification errors gracefully', async () => {
      mockGet.mockResolvedValue({ exists: true });
      mockUpdate.mockResolvedValue();
      
      const mockMatchesSnapshot = {
        forEach: jest.fn((callback) => {
          callback({
            data: () => ({ volunteerId: 'vol1', eventId: 'event123' })
          });
        })
      };
      mockWhere.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockMatchesSnapshot)
      });

      notificationService.sendNotification.mockRejectedValue(new Error('Notification failed'));

      const response = await request(app)
        .post('/events')
        .send(validEventData)
        .expect(200);

      expect(response.body.message).toBe('Event saved successfully');
      // Should not throw error even if notifications fail
    });

    it('should handle database errors during save', async () => {
      mockGet.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/events')
        .send(validEventData)
        .expect(500);

      expect(response.body.message).toBe('Failed to save event');
    });
  });

  describe('GET /events/:eid', () => {
    it('should fetch event by eid successfully', async () => {
      const mockEventData = {
        eid: 'event123',
        eventname: 'Test Event',
        city: 'Houston'
      };

      mockGet.mockResolvedValue({
        exists: true,
        id: 'event123',
        data: () => mockEventData
      });

      const response = await request(app)
        .get('/events/event123')
        .expect(200);

      expect(response.body).toEqual({
        id: 'event123',
        ...mockEventData
      });
      expect(mockDoc).toHaveBeenCalledWith('event123');
    });

    it('should return 404 when event not found', async () => {
      mockGet.mockResolvedValue({ exists: false });

      const response = await request(app)
        .get('/events/nonexistent')
        .expect(404);

      expect(response.body.message).toBe('Event not found');
    });

    it('should handle database errors when fetching event', async () => {
      mockGet.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/events/event123')
        .expect(500);

      expect(response.body.message).toBe('Failed to fetch event');
    });
  });

  describe('DELETE /events/:eid', () => {
    const mockEventData = {
      eid: 'event123',
      eventname: 'Test Event',
      city: 'Houston'
    };

    beforeEach(() => {
      notificationService.sendNotification.mockResolvedValue();
    });

    it('should delete event successfully', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockEventData
      });
      mockDelete.mockResolvedValue();
      
      // Mock matches query for notifications
      const mockMatchesSnapshot = {
        forEach: jest.fn()
      };
      mockWhere.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockMatchesSnapshot)
      });

      const response = await request(app)
        .delete('/events/event123')
        .expect(200);

      expect(response.body.message).toBe('Event deleted successfully');
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should return 404 when trying to delete non-existent event', async () => {
      mockGet.mockResolvedValue({ exists: false });

      const response = await request(app)
        .delete('/events/nonexistent')
        .expect(404);

      expect(response.body.message).toBe('Event not found');
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('should send cancellation notifications to matched volunteers', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockEventData
      });
      mockDelete.mockResolvedValue();
      
      // Mock matches with volunteers
      const mockMatchesSnapshot = {
        forEach: jest.fn((callback) => {
          callback({
            data: () => ({ volunteerId: 'vol1', eventId: 'event123' })
          });
          callback({
            data: () => ({ volunteerId: 'vol2', eventId: 'event123' })
          });
        })
      };
      mockWhere.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockMatchesSnapshot)
      });

      await request(app)
        .delete('/events/event123')
        .expect(200);

      expect(notificationService.sendNotification).toHaveBeenCalledTimes(2);
      expect(notificationService.sendNotification).toHaveBeenCalledWith('vol1', {
        type: 'event_cancelled',
        message: "Event 'Test Event' has been cancelled or deleted.",
        data: {
          eventId: 'event123'
        }
      });
    });

    it('should handle missing eventname in deletion notifications', async () => {
      const eventDataWithoutName = { eid: 'event123', city: 'Houston' };
      
      mockGet.mockResolvedValue({
        exists: true,
        data: () => eventDataWithoutName
      });
      mockDelete.mockResolvedValue();
      
      const mockMatchesSnapshot = {
        forEach: jest.fn((callback) => {
          callback({
            data: () => ({ volunteerId: 'vol1', eventId: 'event123' })
          });
        })
      };
      mockWhere.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockMatchesSnapshot)
      });

      await request(app)
        .delete('/events/event123')
        .expect(200);

      expect(notificationService.sendNotification).toHaveBeenCalledWith('vol1', {
        type: 'event_cancelled',
        message: "Event 'event123' has been cancelled or deleted.",
        data: {
          eventId: 'event123'
        }
      });
    });

    it('should handle notification errors gracefully during deletion', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockEventData
      });
      mockDelete.mockResolvedValue();
      
      const mockMatchesSnapshot = {
        forEach: jest.fn((callback) => {
          callback({
            data: () => ({ volunteerId: 'vol1', eventId: 'event123' })
          });
        })
      };
      mockWhere.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockMatchesSnapshot)
      });

      notificationService.sendNotification.mockRejectedValue(new Error('Notification failed'));

      const response = await request(app)
        .delete('/events/event123')
        .expect(200);

      expect(response.body.message).toBe('Event deleted successfully');
    });

    it('should handle database errors during deletion', async () => {
      mockGet.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/events/event123')
        .expect(500);

      expect(response.body.message).toBe('Failed to delete event');
    });
  });

  describe('Date normalization', () => {
    it('should normalize availability dates to YYYY-MM-DD format', async () => {
      const eventWithDates = {
        eid: 'event123',
        uid: 'user123',
        role: 'organizer',
        eventname: 'Test Event',
        availability: [
          '2024-01-15T10:30:00Z',
          '2024-01-16T14:45:30.123Z',
          '2024-01-17'
        ]
      };

      validateEvent.mockReturnValue([]);
      mockGet.mockResolvedValue({ exists: false });
      mockSet.mockResolvedValue();
      
      const mockMatchesSnapshot = {
        forEach: jest.fn()
      };
      mockWhere.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockMatchesSnapshot)
      });

      await request(app)
        .post('/events')
        .send(eventWithDates)
        .expect(200);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          availability: ['2024-01-15', '2024-01-16', '2024-01-17']
        })
      );
    });
  });

  describe('Route ordering', () => {
    it('should handle /all route before /:eid route', async () => {
      // This test ensures the route ordering is correct
      // /all should be matched before /:eid
      const mockSnapshot = {
        forEach: jest.fn()
      };
      mockGet.mockResolvedValue(mockSnapshot);

      const response = await request(app)
        .get('/events/all')
        .expect(200);

      expect(response.body).toHaveProperty('events');
      expect(mockCollection).toHaveBeenCalledWith('events');
    });
  });
});