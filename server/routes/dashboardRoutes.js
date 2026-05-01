// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");

const Patient = require("../models/patient/Patient");
const Appointment = require("../models/appointment/Appointment");
const Payment = require("../models/finance/Payment");
const Expense = require("../models/finance/Expense");

// GET /api/dashboard/full - Complete dashboard data
router.get("/full", verifyToken, async (req, res) => {
  try {
    // 1. STATS
    const totalPatients = await Patient.countDocuments();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const revenueAgg = await Payment.aggregate([
      { $match: { status: "Success", paymentDate: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const expenseAgg = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;
    const totalExpenses = expenseAgg[0]?.total || 0;

    // 2. RECENT APPOINTMENTS
    const recentAppointments = await Appointment.find()
      .sort({ appointmentDate: -1 })
      .limit(5)
      .populate("patientId", "name phone")
      .lean();

    const formattedAppointments = recentAppointments.map(app => ({
      _id: app._id,
      patientName: app.patientId?.name || "Unknown",
      date: app.appointmentDate,
      status: app.status || "Pending"
    }));

    // 3. RECENT PATIENTS
    const recentPatients = await Patient.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name phone")
      .lean();

    const formattedPatients = recentPatients.map(patient => ({
      _id: patient._id,
      name: patient.name,
      phone: patient.phone || "No phone"
    }));

    // 4. ALERTS
    const alerts = [];
    
    const pendingAppointments = await Appointment.countDocuments({ 
      status: "Pending",
      appointmentDate: { $gte: new Date() }
    });
    
    if (pendingAppointments > 0) {
      alerts.push(`${pendingAppointments} pending appointments need attention`);
    }

    // 5. CHARTS DATA (simplified for now)
    const chartsData = {};

    res.json({
      stats: {
        totalPatients,
        todayAppointments,
        totalRevenue,
        totalExpenses
      },
      appointments: formattedAppointments,
      patients: formattedPatients,
      alerts: alerts,
      charts: chartsData
    });

  } catch (error) {
    console.error("Dashboard API Error:", error);
    res.status(500).json({ 
      error: "Failed to load dashboard data",
      details: error.message 
    });
  }
});

// GET /api/dashboard/stats - Simplified stats only (if needed)
router.get("/stats", verifyToken, async (req, res) => {
  try {
    // Your existing stats logic here
    // ... (keep your original stats code)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;