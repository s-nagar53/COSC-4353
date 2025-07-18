const NotificationAggregator = require('../utils/notificationAggregator');
const matchData = require('../data/memoryMatches');
const notificationService = require('../utils/notificationService');

describe('🔁 NotificationAggregator', () => {
  const matchId = 1;
  const volunteerId = 'vol-001';

  const sampleMatch = {
    id: matchId,
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
    // Reset matchData and notifications
    matchData.matches.length = 0;
    notificationService.clearNotifications?.(); // Only if you added this helper
  });

  it('should return a map of match IDs to notifications', () => {
    // Arrange
    matchData.matches.push(sampleMatch);
    notificationService.sendNotification(volunteerId, sampleNotification);

    // Act
    const result = NotificationAggregator.getMatchNotifications();

    // Assert
    expect(result).toBeDefined();
    expect(result[matchId]).toBeInstanceOf(Array);
    expect(result[matchId].length).toBe(1);
    expect(result[matchId][0].message).toBe(sampleNotification.message);
  });

  it('should return an empty array for matches with no notifications', () => {
    matchData.matches.push({
      id: 2,
      volunteerId: 'vol-002',
      eventId: 'event-002'
    });

    const result = NotificationAggregator.getMatchNotifications();
    expect(result[2]).toBeInstanceOf(Array);
    expect(result[2].length).toBe(0);
  });
});

