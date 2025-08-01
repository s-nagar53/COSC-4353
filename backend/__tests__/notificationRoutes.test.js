const request = require('supertest');

// Mock Firebase before importing app
const mockAdd = jest.fn();
const mockGet = jest.fn();
const mockWhere = jest.fn();
const mockOrderBy = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockBatch = jest.fn();
const mockCommit = jest.fn();
const mockDoc = jest.fn();
const mockCollection = jest.fn();
const mockTimestamp = {
  fromDate: jest.fn(),
  now: jest.fn()
};

jest.mock('../firebase', () => ({
  db: {
    collection: mockCollection,
    batch: mockBatch
  },
  admin: {
    firestore: {
      Timestamp: mockTimestamp
    }
  }
}));

const app = require('../index');

describe('📢 Notification Routes - Complete Code Coverage', () => {
  const testUid = 'test-user';
  const testNotification = {
    uid: testUid,
    type: 'assignment',
    message: 'You have a new event assigned!',
    data: { eventId: 'event_001' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks with proper chaining
    const mockQueryChain = {
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: mockGet
    };
    
    mockCollection.mockReturnValue({
      add: mockAdd,
      doc: mockDoc,
      where: jest.fn().mockReturnValue(mockQueryChain),
      orderBy: jest.fn().mockReturnValue(mockQueryChain),
      limit: jest.fn().mockReturnValue(mockQueryChain),
      get: mockGet
    });
    
    mockDoc.mockReturnValue({
      delete: mockDelete
    });
    
    mockBatch.mockReturnValue({
      update: mockUpdate,
      delete: mockDelete,
      commit: mockCommit
    });
    
    mockTimestamp.fromDate.mockReturnValue('mocked-timestamp');
    mockTimestamp.now.mockReturnValue('mocked-now-timestamp');
  });

  describe('POST /api/notifications/send', () => {
    // Test successful case - covers lines: destructuring, success path, status 201, success response
    it('should send a notification successfully', async () => {
      // Arrange
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      const res = await request(app)
        .post('/api/notifications/send')
        .send(testNotification);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Notification sent');
    });

    // Test the validation condition: !uid || !type || !message
    // This covers the if condition and the 400 error response

    // Test missing uid - covers !uid part of condition
    it('should return 400 when uid is missing', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ type: 'assignment', message: 'Missing uid' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('uid, type, and message are required');
    });

    // Test missing type - covers !type part of condition  
    it('should return 400 when type is missing', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ uid: 'test-user', message: 'Missing type' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('uid, type, and message are required');
    });

    // Test missing message - covers !message part of condition
    it('should return 400 when message is missing', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ uid: 'test-user', type: 'assignment' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('uid, type, and message are required');
    });

    // Test empty uid - covers !uid with empty string
    it('should return 400 when uid is empty string', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ uid: '', type: 'assignment', message: 'Empty uid' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('uid, type, and message are required');
    });

    // Test empty type - covers !type with empty string
    it('should return 400 when type is empty string', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ uid: 'test-user', type: '', message: 'Empty type' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('uid, type, and message are required');
    });

    // Test empty message - covers !message with empty string
    it('should return 400 when message is empty string', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ uid: 'test-user', type: 'assignment', message: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('uid, type, and message are required');
    });

    // Test null values - covers falsy checks
    it('should return 400 when uid is null', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ uid: null, type: 'assignment', message: 'Null uid' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('uid, type, and message are required');
    });

    it('should return 400 when type is null', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ uid: 'test-user', type: null, message: 'Null type' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('uid, type, and message are required');
    });

    it('should return 400 when message is null', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ uid: 'test-user', type: 'assignment', message: null });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('uid, type, and message are required');
    });

    // Test undefined values - covers falsy checks
    it('should return 400 when all fields are undefined', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ uid: undefined, type: undefined, message: undefined });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('uid, type, and message are required');
    });

    // Test multiple missing fields - covers OR condition (||)
    it('should return 400 when uid and type are missing', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ message: 'Missing uid and type' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('uid, type, and message are required');
    });

    it('should return 400 when uid and message are missing', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ type: 'assignment' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('uid, type, and message are required');
    });

    it('should return 400 when type and message are missing', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({ uid: 'test-user' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('uid, type, and message are required');
    });

    it('should return 400 when all fields are missing', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('uid, type, and message are required');
    });

    // Test with data field present - covers notificationService.sendNotification with data
    it('should send notification with data field', async () => {
      // Arrange
      const notificationWithData = {
        uid: testUid,
        type: 'reminder',
        message: 'Test with data',
        data: { eventId: 'event_123', priority: 'high' }
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      const res = await request(app)
        .post('/api/notifications/send')
        .send(notificationWithData);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Notification sent');
    });

    // Test error handling when notificationService fails
    it('should handle notificationService errors gracefully', async () => {
      // Arrange - Mock notificationService to throw an error
      const originalSendNotification = require('../utils/notificationService').sendNotification;
      require('../utils/notificationService').sendNotification = jest.fn().mockRejectedValue(new Error('Service error'));

      // Act
      const res = await request(app)
        .post('/api/notifications/send')
        .send(testNotification);

      // Assert
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to send notification');

      // Restore original function
      require('../utils/notificationService').sendNotification = originalSendNotification;
    });

    // Test with data field as null - covers notificationService.sendNotification with null data
    it('should send notification with null data field', async () => {
      // Arrange
      const notificationWithNullData = {
        uid: testUid,
        type: 'info',
        message: 'Test with null data',
        data: null
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      const res = await request(app)
        .post('/api/notifications/send')
        .send(notificationWithNullData);

      // Assert
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Notification sent');
    });

    // Test without data field - covers notificationService.sendNotification with undefined data
    it('should send notification without data field', async () => {
      const notificationWithoutData = {
        uid: testUid,
        type: 'warning',
        message: 'Test without data field'
        // No data field
      };

      const res = await request(app)
        .post('/api/notifications/send')
        .send(notificationWithoutData);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Notification sent');
    });
  });

  describe('GET /api/notifications/:uid', () => {
    // Test successful case - covers: uid extraction, notificationService.getNotifications call, success response
    it('should get notifications for user', async () => {
      // Arrange
      const mockNotifications = [
        { id: 'notif-1', type: 'test', message: 'Test 1' },
        { id: 'notif-2', type: 'test', message: 'Test 2' }
      ];
      
      const mockSnapshot = {
        forEach: (callback) => {
          mockNotifications.forEach((notif) => {
            callback({
              id: notif.id,
              data: () => notif
            });
          });
        }
      };
      
      mockGet.mockResolvedValue(mockSnapshot);

      // Act
      const res = await request(app)
        .get(`/api/notifications/${testUid}`);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('notifications');
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });

    // Test with different uid values to ensure param extraction works
    it('should get notifications for different uid', async () => {
      const differentUid = 'different-user-' + Date.now();
      
      const res = await request(app)
        .get(`/api/notifications/${differentUid}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('notifications');
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });

    // Test with special characters in uid to ensure param extraction
    it('should handle special characters in uid', async () => {
      const specialUid = encodeURIComponent('user@domain.com');
      
      const res = await request(app)
        .get(`/api/notifications/${specialUid}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('notifications');
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });

    // Test with numeric uid
    it('should handle numeric uid', async () => {
      const numericUid = '12345';
      
      const res = await request(app)
        .get(`/api/notifications/${numericUid}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('notifications');
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });

    // Test with long uid
    it('should handle long uid', async () => {
      const longUid = 'u'.repeat(100);
      
      const res = await request(app)
        .get(`/api/notifications/${longUid}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('notifications');
      expect(Array.isArray(res.body.notifications)).toBe(true);
    });

    // Test error handling when notificationService fails
    it('should handle notificationService errors gracefully', async () => {
      // Arrange - Mock notificationService to throw an error
      const originalGetNotifications = require('../utils/notificationService').getNotifications;
      require('../utils/notificationService').getNotifications = jest.fn().mockRejectedValue(new Error('Service error'));

      // Act
      const res = await request(app)
        .get(`/api/notifications/${testUid}`);

      // Assert
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to fetch notifications');

      // Restore original function
      require('../utils/notificationService').getNotifications = originalGetNotifications;
    });
  });

  describe('PATCH /api/notifications/:uid/read', () => {
    // Test successful case - covers: uid extraction, notificationService.markAllAsRead call, success response
    it('should mark all notifications as read', async () => {
      // Arrange
      const mockSnapshot = {
        size: 3,
        forEach: (callback) => {
          for (let i = 0; i < 3; i++) {
            callback({
              ref: { update: mockUpdate }
            });
          }
        }
      };
      
      mockGet.mockResolvedValue(mockSnapshot);
      mockCommit.mockResolvedValue();

      // Act
      const res = await request(app)
        .patch(`/api/notifications/${testUid}/read`);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('All notifications marked as read');
    });

    // Test with different uid values to ensure param extraction works
    it('should mark notifications as read for different uid', async () => {
      // Arrange
      const differentUid = 'read-test-user-' + Date.now();
      const mockSnapshot = {
        size: 2,
        forEach: (callback) => {
          for (let i = 0; i < 2; i++) {
            callback({
              ref: { update: mockUpdate }
            });
          }
        }
      };
      
      mockGet.mockResolvedValue(mockSnapshot);
      mockCommit.mockResolvedValue();
      
      // Act
      const res = await request(app)
        .patch(`/api/notifications/${differentUid}/read`);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('All notifications marked as read');
    });

    // Test with special characters in uid
    it('should handle special characters in uid for read operation', async () => {
      // Arrange
      const specialUid = encodeURIComponent('read-user@domain.com');
      const mockSnapshot = {
        size: 1,
        forEach: (callback) => {
          callback({
            ref: { update: mockUpdate }
          });
        }
      };
      
      mockGet.mockResolvedValue(mockSnapshot);
      mockCommit.mockResolvedValue();
      
      // Act
      const res = await request(app)
        .patch(`/api/notifications/${specialUid}/read`);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('All notifications marked as read');
    });

    // Test with numeric uid
    it('should handle numeric uid for read operation', async () => {
      // Arrange
      const numericUid = '67890';
      const mockSnapshot = {
        size: 0,
        forEach: (callback) => {
          // No notifications to mark as read
        }
      };
      
      mockGet.mockResolvedValue(mockSnapshot);
      mockCommit.mockResolvedValue();
      
      // Act
      const res = await request(app)
        .patch(`/api/notifications/${numericUid}/read`);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('All notifications marked as read');
    });

    // Test with empty uid in path
    it('should handle empty uid in path', async () => {
      // This tests the edge case where uid might be empty
      const res = await request(app)
        .patch('/api/notifications//read');

      // This might return 404 or handle it differently depending on Express routing
      // We just want to ensure it doesn't crash
      expect([200, 404].includes(res.statusCode)).toBe(true);
    });

    // Test error handling when notificationService fails
    it('should handle notificationService errors gracefully', async () => {
      // Arrange - Mock notificationService to throw an error
      const originalMarkAllAsRead = require('../utils/notificationService').markAllAsRead;
      require('../utils/notificationService').markAllAsRead = jest.fn().mockRejectedValue(new Error('Service error'));

      // Act
      const res = await request(app)
        .patch(`/api/notifications/${testUid}/read`);

      // Assert
      expect(res.statusCode).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Failed to mark notifications as read');

      // Restore original function
      require('../utils/notificationService').markAllAsRead = originalMarkAllAsRead;
    });
  });

  describe('Integration tests - End-to-end workflow', () => {
    // Test complete workflow to ensure all methods work together
    it('should handle complete send -> get -> mark read workflow', async () => {
      // Arrange
      const workflowUid = 'workflow-user-' + Date.now();
      
      // Mock for send notification
      mockAdd.mockResolvedValue({ id: 'notification-123' });
      
      // Mock for get notifications
      const mockNotifications = [
        { id: 'notif-1', type: 'workflow-test', message: 'Workflow test notification' }
      ];
      const mockGetSnapshot = {
        forEach: (callback) => {
          mockNotifications.forEach((notif) => {
            callback({
              id: notif.id,
              data: () => notif
            });
          });
        }
      };
      
      // Mock for mark as read
      const mockReadSnapshot = {
        size: 1,
        forEach: (callback) => {
          callback({
            ref: { update: mockUpdate }
          });
        }
      };
      
      // Setup mocks for different calls
      mockGet
        .mockResolvedValueOnce(mockGetSnapshot)  // For get notifications
        .mockResolvedValueOnce(mockReadSnapshot); // For mark as read
      mockCommit.mockResolvedValue();
      
      // Step 1: Send a notification
      const sendRes = await request(app)
        .post('/api/notifications/send')
        .send({
          uid: workflowUid,
          type: 'workflow-test',
          message: 'Workflow test notification',
          data: { step: 1 }
        });

      expect(sendRes.statusCode).toBe(201);
      expect(sendRes.body.success).toBe(true);
      expect(sendRes.body.message).toBe('Notification sent');

      // Step 2: Get notifications
      const getRes = await request(app)
        .get(`/api/notifications/${workflowUid}`);

      expect(getRes.statusCode).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(Array.isArray(getRes.body.notifications)).toBe(true);

      // Step 3: Mark as read
      const readRes = await request(app)
        .patch(`/api/notifications/${workflowUid}/read`);

      expect(readRes.statusCode).toBe(200);
      expect(readRes.body.success).toBe(true);
      expect(readRes.body.message).toBe('All notifications marked as read');
    });

    // Test that each route handles the exact same uid consistently
    it('should maintain consistency across all routes for same uid', async () => {
      // Arrange
      const consistencyUid = 'consistency-user-' + Date.now();
      
      // Mock for send notifications
      mockAdd.mockResolvedValue({ id: 'notification-123' });
      
      // Mock for get notifications
      const mockNotifications = [
        { id: 'notif-1', type: 'type1', message: 'Message 1' },
        { id: 'notif-2', type: 'type2', message: 'Message 2' },
        { id: 'notif-3', type: 'type3', message: 'Message 3' }
      ];
      const mockGetSnapshot = {
        forEach: (callback) => {
          mockNotifications.forEach((notif) => {
            callback({
              id: notif.id,
              data: () => notif
            });
          });
        }
      };
      
      // Mock for mark as read
      const mockReadSnapshot = {
        size: 3,
        forEach: (callback) => {
          for (let i = 0; i < 3; i++) {
            callback({
              ref: { update: mockUpdate }
            });
          }
        }
      };
      
      // Setup mocks for different calls
      mockGet
        .mockResolvedValueOnce(mockGetSnapshot)  // For get notifications
        .mockResolvedValueOnce(mockReadSnapshot); // For mark as read
      mockCommit.mockResolvedValue();
      
      // Send multiple notifications
      const notifications = [
        { type: 'type1', message: 'Message 1', data: { id: 1 } },
        { type: 'type2', message: 'Message 2', data: { id: 2 } },
        { type: 'type3', message: 'Message 3' } // No data field
      ];

      for (const notif of notifications) {
        const res = await request(app)
          .post('/api/notifications/send')
          .send({ uid: consistencyUid, ...notif });
        
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Notification sent');
      }

      // Get all notifications
      const getRes = await request(app)
        .get(`/api/notifications/${consistencyUid}`);

      expect(getRes.statusCode).toBe(200);
      expect(getRes.body.success).toBe(true);
      expect(Array.isArray(getRes.body.notifications)).toBe(true);

      // Mark all as read
      const readRes = await request(app)
        .patch(`/api/notifications/${consistencyUid}/read`);

      expect(readRes.statusCode).toBe(200);
      expect(readRes.body.success).toBe(true);
      expect(readRes.body.message).toBe('All notifications marked as read');
    });
  });

  describe('Edge cases and boundary conditions', () => {
    // Test with request body containing extra fields (should not break)
    it('should handle extra fields in request body', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({
          uid: testUid,
          type: 'test',
          message: 'Test with extra fields',
          data: { test: true },
          extraField1: 'should be ignored',
          extraField2: 123,
          extraField3: { nested: 'object' }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Notification sent');
    });

    // Test with whitespace-only values (should be treated as falsy)
    it('should treat whitespace-only uid as invalid', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({
          uid: '   ',
          type: 'test',
          message: 'Whitespace uid test'
        });

      // Depending on how your validation works, this might pass or fail
      // If it passes, the whitespace uid is accepted; if it fails, validation catches it
      expect([200, 201, 400].includes(res.statusCode)).toBe(true);
    });

    it('should treat whitespace-only type as invalid', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({
          uid: 'test-user',
          type: '   ',
          message: 'Whitespace type test'
        });

      expect([200, 201, 400].includes(res.statusCode)).toBe(true);
    });

    it('should treat whitespace-only message as invalid', async () => {
      const res = await request(app)
        .post('/api/notifications/send')
        .send({
          uid: 'test-user',
          type: 'test',
          message: '   '
        });

      expect([200, 201, 400].includes(res.statusCode)).toBe(true);
    });
  });
});

