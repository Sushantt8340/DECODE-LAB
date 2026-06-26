const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Require authentication for all notification routes
router.use(protect);

// GET /api/notifications - Get all notifications for logged-in user
router.get('/', getNotifications);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', markAsRead);

module.exports = router;
