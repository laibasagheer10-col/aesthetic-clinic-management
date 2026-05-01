import api from './api';
import toast from 'react-hot-toast';

class NotificationService {
  constructor() {
    this.listeners = [];
    this.unreadCount = 0;
    this.notifications = [];
    this.checkInterval = null;
  }

  // Start polling for notifications
  startPolling(interval = 30000) { // 30 seconds
    this.checkInterval = setInterval(() => {
      this.fetchUnreadCount();
      this.fetchNotifications();
    }, interval);
  }

  stopPolling() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  // Fetch notifications
  async fetchNotifications(limit = 20) {
    try {
      const res = await api.get(`/notifications?limit=${limit}`);
      this.notifications = res.data.notifications;
      this.unreadCount = res.data.unreadCount;
      this.notifyListeners();
      return res.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return null;
    }
  }

  // Fetch unread count only
  async fetchUnreadCount() {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data.count > this.unreadCount) {
        // New notifications arrived
        this.showToastForNewNotifications(res.data.count - this.unreadCount);
      }
      this.unreadCount = res.data.count;
      this.notifyListeners();
      return res.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  // Show toast for new notifications
  showToastForNewNotifications(newCount) {
    if (newCount > 0) {
      toast.success(`🔔 ${newCount} new notification${newCount > 1 ? 's' : ''}`, {
        duration: 3000,
        icon: '🔔'
      });
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      await this.fetchUnreadCount();
      await this.fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }

  // Mark all as read
  async markAllAsRead() {
    try {
      await api.put('/notifications/read-all');
      this.unreadCount = 0;
      this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
      this.notifyListeners();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      await api.delete(`/notifications/${notificationId}`);
      this.notifications = this.notifications.filter(n => n._id !== notificationId);
      await this.fetchUnreadCount();
      this.notifyListeners();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  // Generate system notifications
  async generateSystemNotifications() {
    try {
      const res = await api.post('/notifications/generate');
      if (res.data.success) {
        await this.fetchNotifications();
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error('Error generating notifications:', error);
    }
  }

  // Add listener for state changes
  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        notifications: this.notifications,
        unreadCount: this.unreadCount
      });
    });
  }

  getUnreadCount() {
    return this.unreadCount;
  }

  getNotifications() {
    return this.notifications;
  }
}

export default new NotificationService();