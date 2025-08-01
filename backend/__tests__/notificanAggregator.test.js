const NotificationAggregator = require('../utils/notificationAggregator');
const notificationService = require('../utils/notificationService');

// Mock Firebase
jest.mock('../firebase', () => ({
  db: {
    collection: jest.fn(() => ({
      get: jest.fn(),
      doc: jest.fn(() => ({
        get: jest.fn()
      }))
    }))
  }
}));

describe('🔁 NotificationAggregator', () => {
  const matchId = 'match-001';
  const volunteerId = 'vol-001';

  const sampleMatch = {
    volunteerId,
    eventId: 'event-001',
    status: 'active'
  };

  const sampleNotification = {
    type: 'assignment',
    message: 'You have been matched to an event',
    timestamp: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a map of match IDs to notifications', async () => {
    // Arrange
    const mockMatchesSnapshot = {
      docs: [
        {
          id: matchId,
          data: () => sampleMatch
        }
      ]
    };

    const mockNotifications = [
      {
        id: 'notif-001',
        message: sampleNotification.message,
        type: sampleNotification.type
      }
    ];

    const { db } = require('../firebase');
    db.collection.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockMatchesSnapshot)
    });

    jest.spyOn(notificationService, 'getNotifications').mockResolvedValue(mockNotifications);

    // Act
    const result = await NotificationAggregator.getMatchNotifications();

    // Assert
    expect(result).toBeDefined();
    expect(result[matchId]).toBeInstanceOf(Array);
    expect(result[matchId].length).toBe(1);
    expect(result[matchId][0].message).toBe(sampleNotification.message);
  });

  it('should return an empty array for matches with no notifications', async () => {
    // Arrange
    const mockMatchesSnapshot = {
      docs: [
        {
          id: 'match-002',
          data: () => ({
            volunteerId: 'vol-002',
            eventId: 'event-002'
          })
        }
      ]
    };

    const { db } = require('../firebase');
    db.collection.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockMatchesSnapshot)
    });

    jest.spyOn(notificationService, 'getNotifications').mockResolvedValue([]);

    // Act
    const result = await NotificationAggregator.getMatchNotifications();

    // Assert
    expect(result['match-002']).toBeInstanceOf(Array);
    expect(result['match-002'].length).toBe(0);
  });

  it('should handle Firestore errors gracefully', async () => {
    // Arrange
    const { db } = require('../firebase');
    db.collection.mockReturnValue({
      get: jest.fn().mockRejectedValue(new Error('Firestore error'))
    });

    // Act
    const result = await NotificationAggregator.getMatchNotifications();

    // Assert
    expect(result).toEqual({});
  });
});

