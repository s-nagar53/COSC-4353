// Notification Service (Firestore-based)
const { db, admin } = require('../firebase');

/**
 * Send a notification to a user (volunteer or admin)
 * @param {string} uid - User ID
 * @param {object} notification - Notification object { type, message, data, timestamp }
 */
async function sendNotification(uid, notification) {
  try {
    const notificationData = {
      type: notification.type,
      message: notification.message,
      data: notification.data || {}, // event-specific fields only
      timestamp: notification.timestamp
        ? admin.firestore.Timestamp.fromDate(new Date(notification.timestamp))
        : admin.firestore.Timestamp.now(),
      read: false,
      createdAt: new Date(),
      userId: uid
    };

    // Add notification to Firestore
    await db.collection('notifications').add(notificationData);
    
    console.log(`✅ Notification sent to user ${uid}: ${notification.message}`);
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    throw error;
  }
}

/**
 * Get all notifications for a user
 * @param {string} uid - User ID
 * @returns {Array} Array of notifications
 */
async function getNotifications(uid) {
  try {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', uid)
      .orderBy('timestamp', 'desc')
      .get();

    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return notifications;
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return [];
  }
}

/**
 * Mark all notifications as read for a user
 * @param {string} uid - User ID
 */
async function markAllAsRead(uid) {
  try {
    const snapshot = await db.collection('notifications')
      .where('userId', '==', uid)
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    await batch.commit();
    console.log(`✅ Marked ${snapshot.size} notifications as read for user ${uid}`);
  } catch (error) {
    console.error('❌ Error marking notifications as read:', error);
    throw error;
  }
}

/**
 * Delete a specific notification
 * @param {string} notificationId - Notification document ID
 */
async function deleteNotification(notificationId) {
  try {
    await db.collection('notifications').doc(notificationId).delete();
    console.log(`✅ Deleted notification ${notificationId}`);
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    throw error;
  }
}

/**
 * Delete multiple notifications by IDs
 * @param {Array} notificationIds - Array of notification document IDs
 */
async function deleteNotifications(notificationIds) {
  try {
    const batch = db.batch();
    notificationIds.forEach(id => {
      const docRef = db.collection('notifications').doc(id);
      batch.delete(docRef);
    });
    
    await batch.commit();
    console.log(`✅ Deleted ${notificationIds.length} notifications`);
  } catch (error) {
    console.error('❌ Error deleting notifications:', error);
    throw error;
  }
}

module.exports = {
  sendNotification,
  getNotifications,
  markAllAsRead,
  deleteNotification,
  deleteNotifications,
}; 