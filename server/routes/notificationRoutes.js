const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  generateSystemNotifications,
  getUnreadCount
} = require('../controllers/notificationController');

// All routes require authentication
router.use(verifyToken);

router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.post('/generate', generateSystemNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;