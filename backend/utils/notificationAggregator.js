const matchData = require('../data/memoryMatches');
const notificationService = require('./notificationService');

class NotificationAggregator {
  /**
   * Returns a map of match IDs to notifications for the matched volunteer.
   * { [matchId]: [notifications] }
   */
  static async getMatchNotifications() {
    const notificationsMap = {};
    
    for (const match of matchData.matches) {
      try {
        const notifications = await notificationService.getNotifications(match.volunteerId);
        notificationsMap[match.id] = notifications;
      } catch (error) {
        console.error(`Error fetching notifications for volunteer ${match.volunteerId}:`, error);
        notificationsMap[match.id] = [];
      }
    }
    
    return notificationsMap;
  }
}

module.exports = NotificationAggregator; 