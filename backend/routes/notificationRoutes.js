const express = require('express');
const router = express.Router();
const notificationService = require('../utils/notificationService');

// POST /api/notifications/send
// Body: { uid, type, message, data }
router.post('/send', async (req, res) => {
  try {
    const { uid, type, message, data } = req.body;
    if (!uid || !type || !message) {
      return res.status(400).json({ success: false, message: 'uid, type, and message are required' });
    }
    await notificationService.sendNotification(uid, { type, message, data });
    res.status(201).json({ success: true, message: 'Notification sent' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ success: false, message: 'Failed to send notification', error: error.message });
  }
});

// GET /api/notifications/:uid
// Get all notifications for a user
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const notifications = await notificationService.getNotifications(uid);
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
});

// PATCH /api/notifications/:uid/read
// Mark all notifications as read for a user
router.patch('/:uid/read', async (req, res) => {
  try {
    const { uid } = req.params;
    await notificationService.markAllAsRead(uid);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notifications as read', error: error.message });
  }
});

// DELETE /api/notifications/:notificationId
// Delete a specific notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    await notificationService.deleteNotification(notificationId);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification', error: error.message });
  }
});

module.exports = router; 