const NotificationAggregator = require('../utils/notificationAggregator');
const matchData = require('../data/memoryMatches');
const { notifications } = require('../data/memoryStore');

describe('NotificationAggregator', () => {
  beforeEach(() => {
    // Reset matches and notifications
    matchData.matches.length = 0;
    matchData.matchIdCounter = 1;
    Object.keys(notifications).forEach(key => delete notifications[key]);
  });

  it('should return an empty map if there are no matches', () => {
    const result = NotificationAggregator.getMatchNotifications();
    expect(result).toEqual({});
  });

  it('should map match IDs to notifications for each volunteer', () => {
    // Setup: two matches, each with notifications
    matchData.matches.push(
      { id: 1, volunteerId: 'vol1' },
      { id: 2, volunteerId: 'vol2' }
    );
    notifications['vol1'] = [
      { type: 'assignment', message: 'Assigned to event 1', read: false }
    ];
    notifications['vol2'] = [
      { type: 'reminder', message: 'Reminder for event 2', read: false }
    ];
    const result = NotificationAggregator.getMatchNotifications();
    expect(result).toEqual({
      1: notifications['vol1'],
      2: notifications['vol2']
    });
  });

  it('should return empty arrays for matches with no notifications', () => {
    matchData.matches.push({ id: 3, volunteerId: 'vol3' });
    const result = NotificationAggregator.getMatchNotifications();
    expect(result).toEqual({ 3: [] });
  });
}); 