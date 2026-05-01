import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import notificationService from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Load initial notifications
    loadNotifications();

    // Start polling
    notificationService.startPolling();

    // Add listener for updates
    notificationService.addListener(handleNotificationUpdate);

    // Click outside to close
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      notificationService.stopPolling();
      notificationService.removeListener(handleNotificationUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationUpdate = (data) => {
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  };

  const loadNotifications = async () => {
    setLoading(true);
    await notificationService.fetchNotifications();
    setLoading(false);
  };

  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    await notificationService.deleteNotification(id);
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'Appointment': return '📅';
      case 'Payment': return '💰';
      case 'Reminder': return '⏰';
      case 'LowStock': return '📦';
      case 'Alert': return '⚠️';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return '#f44336';
      case 'High': return '#FF9800';
      case 'Medium': return '#2196F3';
      case 'Low': return '#4CAF50';
      default: return '#999';
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Icon */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          background: isOpen ? '#f0f0f0' : 'transparent'
        }}
      >
        <span style={{ fontSize: '24px' }}>🔔</span>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              background: '#f44336',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '12px',
              minWidth: '18px',
              textAlign: 'center'
            }}
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              width: '350px',
              maxHeight: '500px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              marginTop: '10px',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '15px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0 }}>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  style={{
                    padding: '5px 10px',
                    background: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '10px'
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                  <span style={{ fontSize: '40px' }}>🔔</span>
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleMarkAsRead(notification._id)}
                    style={{
                      padding: '12px',
                      marginBottom: '8px',
                      background: notification.isRead ? '#f9f9f9' : '#e3f2fd',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      borderLeft: `3px solid ${getPriorityColor(notification.priority)}`,
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: notification.isRead ? 'normal' : 'bold',
                          marginBottom: '4px'
                        }}>
                          {notification.title}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          {notification.message}
                        </div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#999',
                          marginTop: '4px',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span>
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          <span style={{
                            padding: '2px 6px',
                            background: '#f0f0f0',
                            borderRadius: '10px',
                            fontSize: '10px'
                          }}>
                            {notification.type}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDelete(notification._id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#999',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: '0 5px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '10px',
              borderTop: '1px solid #eee',
              textAlign: 'center'
            }}>
              <button
                onClick={() => notificationService.generateSystemNotifications()}
                style={{
                  padding: '5px 10px',
                  background: 'none',
                  border: '1px solid #2196F3',
                  color: '#2196F3',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Generate System Notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;