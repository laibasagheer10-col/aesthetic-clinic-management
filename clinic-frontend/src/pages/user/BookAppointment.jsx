import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./user.css";

function BookAppointment() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [formData, setFormData] = useState({
    doctorId: "",
    date: "",
    time: "",
    reason: "",
    type: "Consultation"
  });

  const steps = [
    { number: 1, title: "Select Doctor" },
    { number: 2, title: "Choose Date & Time" },
    { number: 3, title: "Add Details" },
    { number: 4, title: "Confirm" }
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/users?role=Doctor');
      setDoctors(res.data.users || []);
    } catch (error) {
      toast.error('Failed to load doctors');
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      // Mock slots - in real app, fetch from backend
      const slots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
      setAvailableSlots(slots);
    } catch (error) {
      toast.error('Failed to load available slots');
    }
  };

  const handleDoctorSelect = (doctorId) => {
    setFormData({ ...formData, doctorId });
    setCurrentStep(2);
  };

  const handleDateTimeSelect = (date, time) => {
    setFormData({ ...formData, date, time });
    setCurrentStep(3);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      await api.post('/appointments', {
        patientId: user.id,
        doctorId: formData.doctorId,
        appointmentDate: `${formData.date}T${formData.time}`,
        reason: formData.reason,
        type: formData.type,
        status: 'Pending'
      });

      toast.success('Appointment booked successfully!');
      navigate('/user/my-appointments');
    } catch (error) {
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="book-appointment"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1>Book Appointment</h1>

      {/* Progress Steps */}
      <div className="booking-steps">
        {steps.map((step, index) => (
          <div key={step.number} className="step-wrapper">
            <div className={`step ${currentStep >= step.number ? 'active' : ''}`}>
              <span className="step-number">{step.number}</span>
              <span className="step-title">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-line ${currentStep > step.number ? 'active' : ''}`} />
            )}
          </div>
        ))}
      </div>

      <div className="booking-content">
        <AnimatePresence mode="wait">
          {/* Step 1: Select Doctor */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              className="step-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2>Select Doctor</h2>
              <div className="doctors-grid">
                {doctors.map(doctor => (
                  <motion.div
                    key={doctor._id}
                    className="doctor-card"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDoctorSelect(doctor._id)}
                  >
                    <div className="doctor-avatar">
                      {doctor.profileImage ? (
                        <img src={doctor.profileImage} alt={doctor.name} />
                      ) : (
                        <span>👨‍⚕️</span>
                      )}
                    </div>
                    <h3>Dr. {doctor.name}</h3>
                    <p>{doctor.specialization || 'General Physician'}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Date & Time */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              className="step-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2>Select Date & Time</h2>
              <div className="datetime-selector">
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    if (formData.doctorId) {
                      fetchAvailableSlots(formData.doctorId, e.target.value);
                    }
                  }}
                  className="date-picker"
                />
                
                {formData.date && (
                  <div className="time-slots">
                    <h3>Available Slots</h3>
                    <div className="slots-grid">
                      {availableSlots.map(slot => (
                        <motion.button
                          key={slot}
                          className={`slot-btn ${formData.time === slot ? 'selected' : ''}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDateTimeSelect(formData.date, slot)}
                        >
                          {slot}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Add Details */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              className="step-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2>Additional Details</h2>
              <div className="details-form">
                <div className="form-group">
                  <label>Appointment Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Check-up">Regular Check-up</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Reason for Visit</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Describe your symptoms or reason for appointment..."
                    rows="4"
                  />
                </div>

                <motion.button
                  className="next-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentStep(4)}
                >
                  Continue to Confirm
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirm */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              className="step-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2>Confirm Appointment</h2>
              <div className="confirmation-card">
                <div className="confirm-details">
                  <div className="detail-row">
                    <span>Doctor:</span>
                    <strong>
                      Dr. {doctors.find(d => d._id === formData.doctorId)?.name}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Date:</span>
                    <strong>{new Date(formData.date).toLocaleDateString()}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Time:</span>
                    <strong>{formData.time}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Type:</span>
                    <strong>{formData.type}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Reason:</span>
                    <strong>{formData.reason || 'Not specified'}</strong>
                  </div>
                </div>

                <div className="confirmation-actions">
                  <motion.button
                    className="back-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCurrentStep(3)}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    className="confirm-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Booking...' : 'Confirm Appointment'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default BookAppointment;