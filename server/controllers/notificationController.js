const Notification = require('../models/notification/Notification');
const Appointment = require('../models/appointment/Appointment');
const Payment = require('../models/finance/Payment');
const Inventory = require('../models/inventory/Inventory');

// ===== GET NOTIFICATIONS =====
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, page = 1, unreadOnly = false } = req.query;
    
    const query = { userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    
    res.json({
      notifications,
      total,
      unreadCount,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== MARK AS READ =====
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== MARK ALL AS READ =====
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== DELETE NOTIFICATION =====
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== CREATE NOTIFICATION (Internal use) =====
exports.createNotification = async (userId, type, title, message, data = {}, priority = 'Medium') => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data,
      priority
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// ===== GENERATE SYSTEM NOTIFICATIONS =====
exports.generateSystemNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = [];

    // 1. Check today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.find({
      appointmentDate: { $gte: today, $lt: tomorrow }
    }).populate('patientId');

    if (todayAppointments.length > 0) {
      notifications.push({
        userId,
        type: 'Appointment',
        title: 'Today\'s Appointments',
        message: `You have ${todayAppointments.length} appointments today`,
        priority: 'High'
      });
    }

    // 2. Check upcoming appointments (next 24 hours)
    const next24Hours = new Date();
    next24Hours.setHours(next24Hours.getHours() + 24);

    const upcomingAppointments = await Appointment.find({
      appointmentDate: { $gt: tomorrow, $lt: next24Hours }
    });

    if (upcomingAppointments.length > 0) {
      notifications.push({
        userId,
        type: 'Reminder',
        title: 'Upcoming Appointments',
        message: `${upcomingAppointments.length} appointments in the next 24 hours`,
        priority: 'Medium'
      });
    }

    // 3. Check pending payments
    const pendingPayments = await Payment.find({ status: 'Pending' });
    if (pendingPayments.length > 0) {
      notifications.push({
        userId,
        type: 'Payment',
        title: 'Pending Payments',
        message: `${pendingPayments.length} payments pending`,
        priority: 'High'
      });
    }

    // 4. Check low stock items
    const lowStockItems = await Inventory.find({ quantity: { $lt: 10 } });
    if (lowStockItems.length > 0) {
      notifications.push({
        userId,
        type: 'LowStock',
        title: 'Low Stock Alert',
        message: `${lowStockItems.length} items are running low`,
        data: { items: lowStockItems.map(i => i.name) },
        priority: 'Critical'
      });
    }

    // Insert notifications
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({ 
      success: true, 
      message: `Generated ${notifications.length} notifications`,
      notifications 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===== GET UNREAD COUNT =====
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({ userId, isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};