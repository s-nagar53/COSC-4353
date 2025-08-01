const notificationService = require('../utils/notificationService');

// Mock Firebase
jest.mock('../firebase', () => {
  const mockAdd = jest.fn();
  const mockGet = jest.fn();
  const mockWhere = jest.fn();
  const mockOrderBy = jest.fn();
  const mockLimit = jest.fn();
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

  return {
    db: {
      collection: mockCollection,
      batch: mockBatch
    },
    admin: {
      firestore: {
        Timestamp: mockTimestamp
      }
    },
    // Export mocks for test access
    __mocks: {
      mockAdd,
      mockGet,
      mockWhere,
      mockOrderBy,
      mockLimit,
      mockUpdate,
      mockDelete,
      mockBatch,
      mockCommit,
      mockDoc,
      mockCollection,
      mockTimestamp
    }
  };
});

describe('🔔 NotificationService', () => {
  const testUid = 'test-user-123';
  const testNotification = {
    type: 'assignment',
    message: 'You have been assigned to an event',
    data: { eventId: 'event_001' }
  };

  // Get mocks from the module
  const {
    mockAdd,
    mockGet,
    mockWhere,
    mockOrderBy,
    mockLimit,
    mockUpdate,
    mockDelete,
    mockBatch,
    mockCommit,
    mockDoc,
    mockCollection,
    mockTimestamp
  } = require('../firebase').__mocks;

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

  describe('sendNotification', () => {
    it('should send a notification successfully', async () => {
      // Arrange
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, testNotification);

      // Assert
      expect(mockCollection).toHaveBeenCalledWith('notifications');
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: testNotification.type,
        message: testNotification.message,
        data: testNotification.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should send notification without data field', async () => {
      // Arrange
      const notificationWithoutData = {
        type: 'reminder',
        message: 'Test message'
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithoutData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithoutData.type,
        message: notificationWithoutData.message,
        data: {},
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should send notification with null data field', async () => {
      // Arrange
      const notificationWithNullData = {
        type: 'info',
        message: 'Test message',
        data: null
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithNullData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithNullData.type,
        message: notificationWithNullData.message,
        data: {},
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should send notification with undefined data field', async () => {
      // Arrange
      const notificationWithUndefinedData = {
        type: 'info',
        message: 'Test message',
        data: undefined
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithUndefinedData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithUndefinedData.type,
        message: notificationWithUndefinedData.message,
        data: {},
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should send notification with empty object data field', async () => {
      // Arrange
      const notificationWithEmptyData = {
        type: 'info',
        message: 'Test message',
        data: {}
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithEmptyData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithEmptyData.type,
        message: notificationWithEmptyData.message,
        data: {},
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should send notification with complex data structure', async () => {
      // Arrange
      const notificationWithComplexData = {
        type: 'complex',
        message: 'Complex notification',
        data: { 
          nested: { 
            value: 'test',
            array: [1, 2, 3],
            object: { key: 'value' }
          }
        }
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithComplexData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithComplexData.type,
        message: notificationWithComplexData.message,
        data: notificationWithComplexData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should send notification with different user ID', async () => {
      // Arrange
      const differentUid = 'different-user-456';
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(differentUid, testNotification);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: differentUid,
        type: testNotification.type,
        message: testNotification.message,
        data: testNotification.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });
  });

  describe('getNotifications', () => {
    it('should get notifications for user successfully', async () => {
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
      const result = await notificationService.getNotifications(testUid);

      // Assert
      expect(mockCollection).toHaveBeenCalledWith('notifications');
      expect(result).toEqual([
        { id: 'notif-1', type: 'test', message: 'Test 1' },
        { id: 'notif-2', type: 'test', message: 'Test 2' }
      ]);
    });

    it('should return empty array when no notifications exist', async () => {
      // Arrange
      const mockSnapshot = {
        forEach: (callback) => {
          // No notifications
        }
      };
      
      mockGet.mockResolvedValue(mockSnapshot);

      // Act
      const result = await notificationService.getNotifications(testUid);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle notifications with complex data structures', async () => {
      // Arrange
      const mockNotifications = [
        { 
          id: 'notif-1', 
          type: 'complex', 
          message: 'Complex notification',
          data: { nested: { value: 'test' } }
        }
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
      const result = await notificationService.getNotifications(testUid);

      // Assert
      expect(result).toEqual(mockNotifications);
    });

    it('should handle single notification', async () => {
      // Arrange
      const mockNotifications = [
        { id: 'notif-1', type: 'single', message: 'Single notification' }
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
      const result = await notificationService.getNotifications(testUid);

      // Assert
      expect(result).toEqual(mockNotifications);
    });

    it('should handle notifications with different user ID', async () => {
      // Arrange
      const differentUid = 'different-user-456';
      const mockNotifications = [
        { id: 'notif-1', type: 'test', message: 'Test for different user' }
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
      const result = await notificationService.getNotifications(differentUid);

      // Assert
      expect(result).toEqual(mockNotifications);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
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
      await notificationService.markAllAsRead(testUid);

      // Assert
      expect(mockBatch).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledTimes(3);
      expect(mockCommit).toHaveBeenCalled();
    });

    it('should handle case when no unread notifications exist', async () => {
      // Arrange
      const mockSnapshot = {
        size: 0,
        forEach: (callback) => {
          // No unread notifications
        }
      };
      
      mockGet.mockResolvedValue(mockSnapshot);
      mockCommit.mockResolvedValue();

      // Act
      await notificationService.markAllAsRead(testUid);

      // Assert
      expect(mockBatch).toHaveBeenCalled();
      expect(mockCommit).toHaveBeenCalled();
    });

    it('should handle single notification to mark as read', async () => {
      // Arrange
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
      await notificationService.markAllAsRead(testUid);

      // Assert
      expect(mockBatch).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      expect(mockCommit).toHaveBeenCalled();
    });

    it('should handle multiple notifications with different user ID', async () => {
      // Arrange
      const differentUid = 'different-user-456';
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
      await notificationService.markAllAsRead(differentUid);

      // Assert
      expect(mockBatch).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(mockCommit).toHaveBeenCalled();
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification successfully', async () => {
      // Arrange
      const notificationId = 'notification-123';
      mockDelete.mockResolvedValue();

      // Act
      await notificationService.deleteNotification(notificationId);

      // Assert
      expect(mockCollection).toHaveBeenCalledWith('notifications');
      expect(mockDoc).toHaveBeenCalledWith(notificationId);
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should delete notification with different ID format', async () => {
      // Arrange
      const notificationId = 'notif-abc-123';
      mockDelete.mockResolvedValue();

      // Act
      await notificationService.deleteNotification(notificationId);

      // Assert
      expect(mockCollection).toHaveBeenCalledWith('notifications');
      expect(mockDoc).toHaveBeenCalledWith(notificationId);
      expect(mockDelete).toHaveBeenCalled();
    });

    it('should delete notification with numeric ID', async () => {
      // Arrange
      const notificationId = '12345';
      mockDelete.mockResolvedValue();

      // Act
      await notificationService.deleteNotification(notificationId);

      // Assert
      expect(mockCollection).toHaveBeenCalledWith('notifications');
      expect(mockDoc).toHaveBeenCalledWith(notificationId);
      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('deleteNotifications', () => {
    it('should delete multiple notifications successfully', async () => {
      // Arrange
      const notificationIds = ['notif-1', 'notif-2', 'notif-3'];
      mockCommit.mockResolvedValue();

      // Act
      await notificationService.deleteNotifications(notificationIds);

      // Assert
      expect(mockBatch).toHaveBeenCalled();
      expect(mockCollection).toHaveBeenCalledWith('notifications');
      expect(mockDoc).toHaveBeenCalledTimes(3);
      expect(mockDelete).toHaveBeenCalledTimes(3);
      expect(mockCommit).toHaveBeenCalled();
    });

    it('should handle empty array of notification IDs', async () => {
      // Arrange
      const notificationIds = [];
      mockCommit.mockResolvedValue();

      // Act
      await notificationService.deleteNotifications(notificationIds);

      // Assert
      expect(mockBatch).toHaveBeenCalled();
      expect(mockCommit).toHaveBeenCalled();
    });

    it('should delete single notification from array', async () => {
      // Arrange
      const notificationIds = ['single-notif'];
      mockCommit.mockResolvedValue();

      // Act
      await notificationService.deleteNotifications(notificationIds);

      // Assert
      expect(mockBatch).toHaveBeenCalled();
      expect(mockCollection).toHaveBeenCalledWith('notifications');
      expect(mockDoc).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockCommit).toHaveBeenCalled();
    });

    it('should delete notifications with different ID formats', async () => {
      // Arrange
      const notificationIds = ['notif-1', 'abc-123', '456'];
      mockCommit.mockResolvedValue();

      // Act
      await notificationService.deleteNotifications(notificationIds);

      // Assert
      expect(mockBatch).toHaveBeenCalled();
      expect(mockCollection).toHaveBeenCalledWith('notifications');
      expect(mockDoc).toHaveBeenCalledTimes(3);
      expect(mockDelete).toHaveBeenCalledTimes(3);
      expect(mockCommit).toHaveBeenCalled();
    });

    it('should handle notifications with empty data field', async () => {
      // Arrange
      const notificationWithEmptyData = {
        type: 'empty-data',
        message: 'Test with empty data',
        data: ''
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithEmptyData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithEmptyData.type,
        message: notificationWithEmptyData.message,
        data: {},
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with zero data field', async () => {
      // Arrange
      const notificationWithZeroData = {
        type: 'zero-data',
        message: 'Test with zero data',
        data: 0
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithZeroData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithZeroData.type,
        message: notificationWithZeroData.message,
        data: {}, // 0 is falsy, so it defaults to {}
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with boolean data field', async () => {
      // Arrange
      const notificationWithBooleanData = {
        type: 'boolean-data',
        message: 'Test with boolean data',
        data: true
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithBooleanData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithBooleanData.type,
        message: notificationWithBooleanData.message,
        data: notificationWithBooleanData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with array data field', async () => {
      // Arrange
      const notificationWithArrayData = {
        type: 'array-data',
        message: 'Test with array data',
        data: ['item1', 'item2', 'item3']
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithArrayData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithArrayData.type,
        message: notificationWithArrayData.message,
        data: notificationWithArrayData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with function data field', async () => {
      // Arrange
      const notificationWithFunctionData = {
        type: 'function-data',
        message: 'Test with function data',
        data: () => 'test'
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithFunctionData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithFunctionData.type,
        message: notificationWithFunctionData.message,
        data: notificationWithFunctionData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with symbol data field', async () => {
      // Arrange
      const notificationWithSymbolData = {
        type: 'symbol-data',
        message: 'Test with symbol data',
        data: Symbol('test')
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithSymbolData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithSymbolData.type,
        message: notificationWithSymbolData.message,
        data: notificationWithSymbolData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with date data field', async () => {
      // Arrange
      const notificationWithDateData = {
        type: 'date-data',
        message: 'Test with date data',
        data: new Date()
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithDateData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithDateData.type,
        message: notificationWithDateData.message,
        data: notificationWithDateData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with regex data field', async () => {
      // Arrange
      const notificationWithRegexData = {
        type: 'regex-data',
        message: 'Test with regex data',
        data: /test/
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithRegexData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithRegexData.type,
        message: notificationWithRegexData.message,
        data: notificationWithRegexData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with bigint data field', async () => {
      // Arrange
      const notificationWithBigIntData = {
        type: 'bigint-data',
        message: 'Test with bigint data',
        data: BigInt(123)
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithBigIntData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithBigIntData.type,
        message: notificationWithBigIntData.message,
        data: notificationWithBigIntData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with map data field', async () => {
      // Arrange
      const notificationWithMapData = {
        type: 'map-data',
        message: 'Test with map data',
        data: new Map([['key1', 'value1'], ['key2', 'value2']])
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithMapData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithMapData.type,
        message: notificationWithMapData.message,
        data: notificationWithMapData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with set data field', async () => {
      // Arrange
      const notificationWithSetData = {
        type: 'set-data',
        message: 'Test with set data',
        data: new Set(['item1', 'item2', 'item3'])
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithSetData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithSetData.type,
        message: notificationWithSetData.message,
        data: notificationWithSetData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with weakmap data field', async () => {
      // Arrange
      const notificationWithWeakMapData = {
        type: 'weakmap-data',
        message: 'Test with weakmap data',
        data: new WeakMap()
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithWeakMapData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithWeakMapData.type,
        message: notificationWithWeakMapData.message,
        data: notificationWithWeakMapData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with weakset data field', async () => {
      // Arrange
      const notificationWithWeakSetData = {
        type: 'weakset-data',
        message: 'Test with weakset data',
        data: new WeakSet()
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithWeakSetData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithWeakSetData.type,
        message: notificationWithWeakSetData.message,
        data: notificationWithWeakSetData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with promise data field', async () => {
      // Arrange
      const notificationWithPromiseData = {
        type: 'promise-data',
        message: 'Test with promise data',
        data: Promise.resolve('test')
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithPromiseData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithPromiseData.type,
        message: notificationWithPromiseData.message,
        data: notificationWithPromiseData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with async generator data field', async () => {
      // Arrange
      async function* testAsyncGenerator() {
        yield 1;
        yield 2;
        yield 3;
      }
      const notificationWithAsyncGeneratorData = {
        type: 'async-generator-data',
        message: 'Test with async generator data',
        data: testAsyncGenerator()
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithAsyncGeneratorData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithAsyncGeneratorData.type,
        message: notificationWithAsyncGeneratorData.message,
        data: notificationWithAsyncGeneratorData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with proxy data field', async () => {
      // Arrange
      const target = { name: 'test' };
      const handler = {
        get(target, prop) {
          return target[prop];
        }
      };
      const notificationWithProxyData = {
        type: 'proxy-data',
        message: 'Test with proxy data',
        data: new Proxy(target, handler)
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithProxyData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithProxyData.type,
        message: notificationWithProxyData.message,
        data: notificationWithProxyData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with reflect data field', async () => {
      // Arrange
      const notificationWithReflectData = {
        type: 'reflect-data',
        message: 'Test with reflect data',
        data: Reflect
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithReflectData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithReflectData.type,
        message: notificationWithReflectData.message,
        data: notificationWithReflectData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with intl data field', async () => {
      // Arrange
      const notificationWithIntlData = {
        type: 'intl-data',
        message: 'Test with intl data',
        data: new Intl.DateTimeFormat()
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithIntlData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithIntlData.type,
        message: notificationWithIntlData.message,
        data: notificationWithIntlData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with json data field', async () => {
      // Arrange
      const notificationWithJsonData = {
        type: 'json-data',
        message: 'Test with json data',
        data: JSON
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithJsonData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithJsonData.type,
        message: notificationWithJsonData.message,
        data: notificationWithJsonData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with math data field', async () => {
      // Arrange
      const notificationWithMathData = {
        type: 'math-data',
        message: 'Test with math data',
        data: Math
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithMathData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithMathData.type,
        message: notificationWithMathData.message,
        data: notificationWithMathData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with string data field', async () => {
      // Arrange
      const notificationWithStringData = {
        type: 'string-data',
        message: 'Test with string data',
        data: 'test string'
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithStringData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithStringData.type,
        message: notificationWithStringData.message,
        data: notificationWithStringData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with number data field', async () => {
      // Arrange
      const notificationWithNumberData = {
        type: 'number-data',
        message: 'Test with number data',
        data: 42
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithNumberData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithNumberData.type,
        message: notificationWithNumberData.message,
        data: notificationWithNumberData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with error data field', async () => {
      // Arrange
      const notificationWithErrorData = {
        type: 'error-data',
        message: 'Test with error data',
        data: new Error('test error')
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithErrorData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithErrorData.type,
        message: notificationWithErrorData.message,
        data: notificationWithErrorData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with buffer data field', async () => {
      // Arrange
      const notificationWithBufferData = {
        type: 'buffer-data',
        message: 'Test with buffer data',
        data: Buffer.from('test')
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithBufferData);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithBufferData.type,
        message: notificationWithBufferData.message,
        data: notificationWithBufferData.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with timestamp field', async () => {
      // Arrange
      const notificationWithTimestamp = {
        type: 'timestamp-data',
        message: 'Test with timestamp',
        data: { eventId: 'event_123' },
        timestamp: new Date('2023-01-01T00:00:00Z')
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithTimestamp);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithTimestamp.type,
        message: notificationWithTimestamp.message,
        data: notificationWithTimestamp.data,
        read: false,
        timestamp: 'mocked-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications without timestamp field', async () => {
      // Arrange
      const notificationWithoutTimestamp = {
        type: 'no-timestamp',
        message: 'Test without timestamp',
        data: { eventId: 'event_456' }
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithoutTimestamp);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithoutTimestamp.type,
        message: notificationWithoutTimestamp.message,
        data: notificationWithoutTimestamp.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with null timestamp field', async () => {
      // Arrange
      const notificationWithNullTimestamp = {
        type: 'null-timestamp',
        message: 'Test with null timestamp',
        data: { eventId: 'event_789' },
        timestamp: null
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithNullTimestamp);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithNullTimestamp.type,
        message: notificationWithNullTimestamp.message,
        data: notificationWithNullTimestamp.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with undefined timestamp field', async () => {
      // Arrange
      const notificationWithUndefinedTimestamp = {
        type: 'undefined-timestamp',
        message: 'Test with undefined timestamp',
        data: { eventId: 'event_999' },
        timestamp: undefined
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithUndefinedTimestamp);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithUndefinedTimestamp.type,
        message: notificationWithUndefinedTimestamp.message,
        data: notificationWithUndefinedTimestamp.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with empty string timestamp field', async () => {
      // Arrange
      const notificationWithEmptyTimestamp = {
        type: 'empty-timestamp',
        message: 'Test with empty timestamp',
        data: { eventId: 'event_000' },
        timestamp: ''
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithEmptyTimestamp);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithEmptyTimestamp.type,
        message: notificationWithEmptyTimestamp.message,
        data: notificationWithEmptyTimestamp.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with zero timestamp field', async () => {
      // Arrange
      const notificationWithZeroTimestamp = {
        type: 'zero-timestamp',
        message: 'Test with zero timestamp',
        data: { eventId: 'event_111' },
        timestamp: 0
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithZeroTimestamp);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithZeroTimestamp.type,
        message: notificationWithZeroTimestamp.message,
        data: notificationWithZeroTimestamp.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with false timestamp field', async () => {
      // Arrange
      const notificationWithFalseTimestamp = {
        type: 'false-timestamp',
        message: 'Test with false timestamp',
        data: { eventId: 'event_222' },
        timestamp: false
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithFalseTimestamp);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithFalseTimestamp.type,
        message: notificationWithFalseTimestamp.message,
        data: notificationWithFalseTimestamp.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with NaN timestamp field', async () => {
      // Arrange
      const notificationWithNaNTimestamp = {
        type: 'nan-timestamp',
        message: 'Test with NaN timestamp',
        data: { eventId: 'event_333' },
        timestamp: NaN
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithNaNTimestamp);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithNaNTimestamp.type,
        message: notificationWithNaNTimestamp.message,
        data: notificationWithNaNTimestamp.data,
        read: false,
        timestamp: 'mocked-now-timestamp',
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with infinity timestamp field', async () => {
      // Arrange
      const notificationWithInfinityTimestamp = {
        type: 'infinity-timestamp',
        message: 'Test with infinity timestamp',
        data: { eventId: 'event_444' },
        timestamp: Infinity
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithInfinityTimestamp);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithInfinityTimestamp.type,
        message: notificationWithInfinityTimestamp.message,
        data: notificationWithInfinityTimestamp.data,
        read: false,
        timestamp: 'mocked-timestamp', // Infinity is truthy, so it uses the timestamp
        createdAt: expect.any(Date)
      });
    });

    it('should handle notifications with negative infinity timestamp field', async () => {
      // Arrange
      const notificationWithNegativeInfinityTimestamp = {
        type: 'negative-infinity-timestamp',
        message: 'Test with negative infinity timestamp',
        data: { eventId: 'event_555' },
        timestamp: -Infinity
      };
      mockAdd.mockResolvedValue({ id: 'notification-123' });

      // Act
      await notificationService.sendNotification(testUid, notificationWithNegativeInfinityTimestamp);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith({
        userId: testUid,
        type: notificationWithNegativeInfinityTimestamp.type,
        message: notificationWithNegativeInfinityTimestamp.message,
        data: notificationWithNegativeInfinityTimestamp.data,
        read: false,
        timestamp: 'mocked-timestamp', // -Infinity is truthy, so it uses the timestamp
        createdAt: expect.any(Date)
      });
    });
  });
}); 