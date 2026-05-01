import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./user.css";

function UserDashboard() {
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    totalVisits: 0,
    pendingPayments: 0
  });
  const [nextAppointment, setNextAppointment] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Fetch appointments
      const appointmentsRes = await api.get('/appointments');
      const userAppointments = appointmentsRes.data.filter(
        app => app.patientId?._id === user.id
      );

      // Calculate stats
      const upcoming = userAppointments.filter(
        app => app.status === 'Pending' && new Date(app.date) > new Date()
      ).length;

      const total = userAppointments.length;

      // Find next appointment
      const next = userAppointments
        .filter(app => app.status === 'Pending' && new Date(app.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

      // Fetch payments
      const paymentsRes = await api.get('/payments');
      const userPayments = paymentsRes.data.filter(
        p => p.patientId?._id === user.id
      );
      const pending = userPayments.filter(p => p.status === 'Pending').length;

      setStats({
        upcomingAppointments: upcoming,
        totalVisits: total,
        pendingPayments: pending
      });

      if (next) {
        setNextAppointment(next);
      }

      // Recent activity (combine appointments and payments)
      const activity = [
        ...userAppointments.slice(0, 3).map(a => ({
          id: a._id,
          type: 'appointment',
          title: `Appointment with Dr. ${a.doctorName || 'Doctor'}`,
          date: a.date,
          status: a.status
        })),
        ...userPayments.slice(0, 3).map(p => ({
          id: p._id,
          type: 'payment',
          title: `Payment of ₹${p.amount}`,
          date: p.createdAt,
          status: p.status
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      setRecentActivity(activity);

    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="user-dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Quick Stats */}
      <div className="stats-grid">
        <motion.div 
          className="stat-card"
          whileHover={{ y: -5 }}
        >
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Upcoming</h3>
            <p className="stat-value">{stats.upcomingAppointments}</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          whileHover={{ y: -5 }}
        >
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <h3>Total Visits</h3>
            <p className="stat-value">{stats.totalVisits}</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          whileHover={{ y: -5 }}
        >
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Pending Payments</h3>
            <p className="stat-value">{stats.pendingPayments}</p>
          </div>
        </motion.div>
      </div>

      {/* Next Appointment */}
      {nextAppointment ? (
        <motion.div 
          className="next-appointment-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3>Your Next Appointment</h3>
          <div className="appointment-details">
            <div className="detail-item">
              <span className="label">Date:</span>
              <span className="value">{new Date(nextAppointment.date).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Time:</span>
              <span className="value">{new Date(nextAppointment.date).toLocaleTimeString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Doctor:</span>
              <span className="value">Dr. {nextAppointment.doctorName || 'General'}</span>
            </div>
          </div>
          <Link to="/user/my-appointments" className="view-link">
            View Details →
          </Link>
        </motion.div>
      ) : (
        <motion.div 
          className="no-appointment-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p>No upcoming appointments</p>
          <Link to="/user/book-appointment" className="book-btn">
            Book Appointment
          </Link>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div 
        className="recent-activity"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {recentActivity.map((activity, index) => (
            <motion.div 
              key={`${activity.type}-${activity.id}`}
              className="activity-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className="activity-icon">
                {activity.type === 'appointment' ? '📅' : '💰'}
              </div>
              <div className="activity-details">
                <p className="activity-title">{activity.title}</p>
                <span className="activity-date">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </div>
              <span className={`activity-status ${activity.status.toLowerCase()}`}>
                {activity.status}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default UserDashboard;