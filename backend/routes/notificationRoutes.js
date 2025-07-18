const express = require('express');
const router = express.Router();
const notificationService = require('../utils/notificationService');

// POST /api/notifications/send
// Body: { uid, type, message, data }
router.post('/send', (req, res) => {
  const { uid, type, message, data } = req.body;
  if (!uid || !type || !message) {
    return res.status(400).json({ success: false, message: 'uid, type, and message are required' });
  }
  notificationService.sendNotification(uid, { type, message, data });
  res.status(201).json({ success: true, message: 'Notification sent' });
});

// GET /api/notifications/:uid
// Get all notifications for a user
router.get('/:uid', (req, res) => {
  const { uid } = req.params;
  const notifications = notificationService.getNotifications(uid);
  res.json({ success: true, notifications });
});

// PATCH /api/notifications/:uid/read
// Mark all notifications as read for a user
router.patch('/:uid/read', (req, res) => {
  const { uid } = req.params;
  notificationService.markAllAsRead(uid);
  res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = router; 