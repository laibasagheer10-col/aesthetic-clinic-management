import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./user.css";

function Payments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const paymentMethods = ["Card", "Cash", "Easypaisa", "JazzCash"];
  const statuses = ["All", "Success", "Pending", "Failed"];

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));

      // Fetch payments
      const paymentsRes = await api.get("/payments");
      const userPayments = paymentsRes.data.filter(
        (p) => p.patientId?._id === user.id || p.patientId === user.id
      );
      setPayments(userPayments);

      // Fetch unpaid appointments
      const appointmentsRes = await api.get("/appointments");
      const unpaidAppointments = appointmentsRes.data.filter(
        (a) =>
          (a.patientId?._id === user.id || a.patientId === user.id) &&
          a.paymentStatus === "Unpaid" &&
          a.status !== "Cancelled"
      );
      setAppointments(unpaidAppointments);
    } catch (error) {
      toast.error("Failed to load payment data");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e, appointmentId) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const paymentData = {
      appointmentId: appointmentId,
      patientId: JSON.parse(localStorage.getItem("user")).id,
      amount: parseFloat(formData.get("amount")),
      paymentMethod: formData.get("method"),
      transactionId: formData.get("transactionId") || "",
      status: "Pending",
    };

    try {
      await api.post("/payments", paymentData);
      toast.success("Payment recorded successfully!");
      setShowPaymentForm(false);
      setSelectedAppointment(null);
      fetchPaymentData();
    } catch (error) {
      toast.error("Failed to process payment");
      console.error("Error:", error);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (filterStatus === "All") return true;
    return payment.status === filterStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Success":
        return "#4CAF50";
      case "Pending":
        return "#FF9800";
      case "Failed":
        return "#f44336";
      default:
        return "#666";
    }
  };

  const getTotalAmount = () => {
    return payments
      .filter((p) => p.status === "Success")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const getPendingAmount = () => {
    return payments
      .filter((p) => p.status === "Pending")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
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
      className="payments-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="page-header">
        <h1>💰 Payments</h1>
      </div>

      {/* Payment Summary Cards */}
      <div className="payment-summary">
        <motion.div
          className="summary-card"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="summary-icon">📊</div>
          <div className="summary-content">
            <label>Total Paid</label>
            <h3>PKR {getTotalAmount().toLocaleString("en-PK")}</h3>
          </div>
        </motion.div>

        <motion.div
          className="summary-card warning"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="summary-icon">⏳</div>
          <div className="summary-content">
            <label>Pending Amount</label>
            <h3>PKR {getPendingAmount().toLocaleString("en-PK")}</h3>
          </div>
        </motion.div>

        <motion.div
          className="summary-card"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="summary-icon">📈</div>
          <div className="summary-content">
            <label>Total Transactions</label>
            <h3>{payments.length}</h3>
          </div>
        </motion.div>
      </div>

      {/* New Payment Section */}
      {appointments.length > 0 && !showPaymentForm && (
        <motion.div
          className="new-payment-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>📝 Unpaid Appointments</h3>
          <div className="unpaid-list">
            {appointments.map((apt) => (
              <motion.div
                key={apt._id}
                className="unpaid-item"
                whileHover={{ scale: 1.02 }}
              >
                <div className="unpaid-info">
                  <p>
                    <strong>
                      {new Date(apt.appointmentDate).toLocaleDateString("en-PK")}
                    </strong>
                  </p>
                  <p className="doctor-name">Dr. {apt.doctorId?.name || "Staff"}</p>
                </div>
                <motion.button
                  className="pay-now-btn"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedAppointment(apt);
                    setShowPaymentForm(true);
                  }}
                >
                  Pay Now
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Payment Form */}
      {showPaymentForm && selectedAppointment && (
        <motion.div
          className="payment-form-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3>Make Payment</h3>
          <form
            onSubmit={(e) => handlePaymentSubmit(e, selectedAppointment._id)}
            className="payment-form"
          >
            <div className="appointment-summary-form">
              <p>
                <strong>Appointment Date:</strong>{" "}
                {new Date(selectedAppointment.appointmentDate).toLocaleDateString(
                  "en-PK"
                )}
              </p>
              <p>
                <strong>Doctor:</strong> Dr. {selectedAppointment.doctorId?.name || "Staff"}
              </p>
            </div>

            <div className="form-group">
              <label>Amount (PKR)</label>
              <input
                type="number"
                name="amount"
                placeholder="Enter amount"
                required
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select name="method" required>
                <option value="">Select Payment Method</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Transaction ID (if applicable)</label>
              <input
                type="text"
                name="transactionId"
                placeholder="e.g., TXN123456"
              />
            </div>

            <div className="form-actions">
              <motion.button
                type="submit"
                className="submit-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Confirm Payment
              </motion.button>
              <motion.button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowPaymentForm(false);
                  setSelectedAppointment(null);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Payment History Filter */}
      <div className="payment-history-section">
        <h3>📜 Payment History</h3>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {statuses.map((status) => (
            <motion.button
              key={status}
              className={`filter-tab ${filterStatus === status ? "active" : ""}`}
              onClick={() => setFilterStatus(status)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status}
              <span className="count">
                {status === "All"
                  ? payments.length
                  : payments.filter((p) => p.status === status).length}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Payments List */}
        {filteredPayments.length > 0 ? (
          <div className="payments-list">
            {filteredPayments.map((payment, index) => (
              <motion.div
                key={payment._id}
                className="payment-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="payment-left">
                  <div className="payment-date">
                    {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString(
                      "en-PK"
                    )}
                  </div>
                  <div className="payment-details">
                    <p className="method">{payment.paymentMethod}</p>
                    <p className="transaction">{payment.transactionId || "N/A"}</p>
                  </div>
                </div>

                <div className="payment-right">
                  <div className="payment-amount">
                    PKR {payment.amount?.toLocaleString("en-PK")}
                  </div>
                  <span
                    className="payment-status"
                    style={{ backgroundColor: getStatusColor(payment.status) }}
                  >
                    {payment.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💳</div>
            <h2>No Payment History</h2>
            <p>You haven't made any payments yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Payments;
