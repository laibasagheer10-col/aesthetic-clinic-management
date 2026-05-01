import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import AppointmentModal from "../../components/admin/AppointmentModal";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  
  // 🔥 MODAL STATES
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/appointments");
      
      // 🔥 TRANSFORM DATA IF BACKEND SENDS POPULATED OBJECTS
      const formattedData = res.data.map(app => ({
        _id: app._id,
        patientId: app.patientId?._id || app.patientId,
        patientName: app.patientName || app.patientId?.name || "Unknown",
        patientPhone: app.patientPhone || app.patientId?.phone || "",
        date: app.date || app.appointmentDate,
        status: app.status || "Pending",
        raw: app
      }));
      
      setAppointments(formattedData);
    } catch (error) {
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      toast.success("Status Updated ✅");
      fetchAppointments();
    } catch (error) {
      toast.error("Update failed ❌");
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    
    try {
      await api.delete(`/appointments/${id}`);
      toast.success("Appointment Deleted ✅");
      fetchAppointments();
    } catch (error) {
      toast.error("Delete failed ❌");
    }
  };

  const filtered = statusFilter
    ? appointments.filter(a => a.status === statusFilter)
    : appointments;

  // Status badge color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return '#4CAF50';
      case 'Pending': return '#FF9800';
      case 'Cancelled': return '#f44336';
      default: return '#999';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: "20px" }}
    >
      <h1>📅 Appointments</h1>

      {/* FILTER AND ACTIONS */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <select 
          onChange={(e) => setStatusFilter(e.target.value)}
          value={statusFilter}
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            minWidth: "150px"
          }}
        >
          <option value="">All Appointments</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* 🔥 ADD BUTTON - Opens modal */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          style={{
            padding: "8px 16px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          + New Appointment
        </motion.button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #3498db",
              borderRadius: "50%",
              margin: "0 auto"
            }}
          />
        </div>
      ) : (
        <>
          {/* TABLE */}
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
            }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: "12px", textAlign: "left" }}>Patient</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Date & Time</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length > 0 ? (
                  filtered.map(a => (
                    <motion.tr 
                      key={a._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: "bold" }}>{a.patientName}</div>
                        {a.patientPhone && <div><small style={{ color: "#666" }}>{a.patientPhone}</small></div>}
                      </td>
                      
                      <td style={{ padding: "12px" }}>
                        {a.date ? (
                          <>
                            <div>{new Date(a.date).toLocaleDateString()}</div>
                            <small style={{ color: "#666" }}>{new Date(a.date).toLocaleTimeString()}</small>
                          </>
                        ) : 'Date not set'}
                      </td>
                      
                      <td style={{ padding: "12px" }}>
                        <span style={{
                          padding: "4px 12px",
                          background: getStatusColor(a.status),
                          color: "white",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          display: "inline-block"
                        }}>
                          {a.status}
                        </span>
                      </td>
                      
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                          {a.status !== "Completed" && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateStatus(a._id, "Completed")}
                              style={{
                                padding: "5px 10px",
                                background: "#4CAF50",
                                color: "white",
                                border: "none",
                                borderRadius: "3px",
                                cursor: "pointer",
                                fontSize: "12px"
                              }}
                              title="Mark as Completed"
                            >
                              ✓ Complete
                            </motion.button>
                          )}
                          
                          {/* 🔥 EDIT BUTTON */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setEditData(a);
                              setModalOpen(true);
                            }}
                            style={{
                              padding: "5px 10px",
                              background: "#2196F3",
                              color: "white",
                              border: "none",
                              borderRadius: "3px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                            title="Edit Appointment"
                          >
                            ✏️ Edit
                          </motion.button>

                          {/* 🔥 DELETE BUTTON */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteAppointment(a._id)}
                            style={{
                              padding: "5px 10px",
                              background: "#f44336",
                              color: "white",
                              border: "none",
                              borderRadius: "3px",
                              cursor: "pointer",
                              fontSize: "12px"
                            }}
                            title="Delete Appointment"
                          >
                            🗑️ Delete
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "#999" }}>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        📅 No appointments found
                        <div style={{ marginTop: "10px" }}>
                          <button 
                            onClick={() => {
                              setEditData(null);
                              setModalOpen(true);
                            }}
                            style={{
                              padding: "8px 16px",
                              background: "#4CAF50",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                          >
                            Create First Appointment
                          </button>
                        </div>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* SUMMARY CARDS */}
          <div style={{ 
            marginTop: "20px", 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "15px"
          }}>
            <motion.div 
              whileHover={{ scale: 1.02 }}
              style={{
                padding: "15px",
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2196F3" }}>
                {appointments.length}
              </div>
              <div style={{ color: "#666" }}>Total Appointments</div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              style={{
                padding: "15px",
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#FF9800" }}>
                {appointments.filter(a => a.status === "Pending").length}
              </div>
              <div style={{ color: "#666" }}>Pending</div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.02 }}
              style={{
                padding: "15px",
                background: "white",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                textAlign: "center"
              }}
            >
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#4CAF50" }}>
                {appointments.filter(a => a.status === "Completed").length}
              </div>
              <div style={{ color: "#666" }}>Completed</div>
            </motion.div>
          </div>
        </>
      )}

      {/* 🔥 APPOINTMENT MODAL */}
      <AppointmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        refresh={fetchAppointments}
        editData={editData}
      />
    </motion.div>
  );
}

export default Appointments;