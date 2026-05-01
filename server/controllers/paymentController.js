// server/controllers/paymentController.js
const Payment = require('../models/finance/Payment');

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const payment = await Payment.create({
      ...req.body,
      paymentDate: req.body.paymentDate || Date.now()
    });
    
    // Populate for response
    const populatedPayment = await Payment.findById(payment._id)
      .populate('patientId')
      .populate('appointmentId');
      
    res.status(201).json(populatedPayment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("patientId")
      .populate("appointmentId")
      .sort({ createdAt: -1 }); // Latest first
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single payment
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("patientId")
      .populate("appointmentId");
    
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("patientId").populate("appointmentId");
    
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get payment stats
exports.getPaymentStats = async (req, res) => {
  try {
    const payments = await Payment.find();
    
    const totalRevenue = payments
      .filter(p => p.status === 'Success')
      .reduce((sum, p) => sum + p.amount, 0);
      
    const pendingAmount = payments
      .filter(p => p.status === 'Pending')
      .reduce((sum, p) => sum + p.amount, 0);
      
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRevenue = payments
      .filter(p => p.status === 'Success' && new Date(p.paymentDate) >= today)
      .reduce((sum, p) => sum + p.amount, 0);
      
    const monthlyRevenue = payments
      .filter(p => {
        const date = new Date(p.paymentDate);
        return p.status === 'Success' && 
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
      })
      .reduce((sum, p) => sum + p.amount, 0);
    
    res.json({
      totalRevenue,
      pendingAmount,
      todayRevenue,
      monthlyRevenue,
      totalTransactions: payments.length,
      successfulTransactions: payments.filter(p => p.status === 'Success').length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};