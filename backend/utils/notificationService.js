// Notification Service (in-memory, easily swappable for DB)
const { notifications } = require('../data/memoryStore');

/**
 * Send a notification to a user (volunteer or admin)
 * @param {string} uid - User ID
 * @param {object} notification - Notification object { type, message, data, timestamp }
 */
function sendNotification(uid, notification) {
  if (!notifications[uid]) {
    notifications[uid] = [];
  }
  notifications[uid].push({
    ...notification,
    timestamp: notification.timestamp || new Date().toISOString(),
    read: false,
  });
}

/**
 * Get all notifications for a user
 * @param {string} uid - User ID
 * @returns {Array} Array of notifications
 */
function getNotifications(uid) {
  return notifications[uid] || [];
}

/**
 * Mark all notifications as read for a user
 * @param {string} uid - User ID
 */
function markAllAsRead(uid) {
  if (notifications[uid]) {
    notifications[uid].forEach(n => n.read = true);
  }
}

module.exports = {
  sendNotification,
  getNotifications,
  markAllAsRead,
}; 