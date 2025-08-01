const { db } = require('../firebase');
const notificationService = require('./notificationService');

class NotificationAggregator {
  /**
   * Returns a map of match IDs to notifications for the matched volunteer.
   * { [matchId]: [notifications] }
   */
  static async getMatchNotifications() {
    const notificationsMap = {};
    
    try {
      // Get all matches from Firestore
      const matchesSnapshot = await db.collection('matches').get();
      
      for (const matchDoc of matchesSnapshot.docs) {
        const match = matchDoc.data();
        const matchId = matchDoc.id;
        
        try {
          const notifications = await notificationService.getNotifications(match.volunteerId);
          notificationsMap[matchId] = notifications;
        } catch (error) {
          console.error(`Error fetching notifications for volunteer ${match.volunteerId}:`, error);
          notificationsMap[matchId] = [];
        }
      }
    } catch (error) {
      console.error('Error fetching matches from Firestore:', error);
    }
    
    return notificationsMap;
  }
}

module.exports = NotificationAggregator; 