const matchData = require('../data/memoryMatches');
const notificationService = require('./notificationService');

class NotificationAggregator {
  /**
   * Returns a map of match IDs to notifications for the matched volunteer.
   * { [matchId]: [notifications] }
   */
  static getMatchNotifications() {
    const notificationsMap = {};
    for (const match of matchData.matches) {
      notificationsMap[match.id] = notificationService.getNotifications(match.volunteerId);
    }
    return notificationsMap;
  }
}

module.exports = NotificationAggregator; 