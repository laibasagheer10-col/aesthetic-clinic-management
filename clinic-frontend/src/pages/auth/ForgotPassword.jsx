import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setLoading(true);

    try {
      console.log('Sending forgot password request for:', email);
      
      const response = await api.post('/auth/forgot-password', { email });

      console.log('Forgot password response:', response.data);

      if (response.data.success) {
        setSubmitted(true);
        toast.success('Reset link sent to your email!');
      } else {
        toast.error(response.data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send reset email. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="auth-card">
        <motion.div 
          className="auth-header"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
        >
          <h1>Forgot Password? 🔐</h1>
          <p>We'll send you a reset link</p>
        </motion.div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <motion.div 
              className="form-group"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({});
                }}
                placeholder="Enter your registered email"
                className={errors.email ? 'error' : ''}
                required
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </motion.div>

            <motion.button
              type="submit"
              className="auth-btn"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </motion.button>
          </form>
        ) : (
          <motion.div 
            className="success-message"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <div className="success-icon">✅</div>
            <h3>Check Your Email!</h3>
            <p>We've sent a password reset link to:</p>
            <strong>{email}</strong>
            <div className="info-box">
              <p className="info-text">📧 The link will expire in 10 minutes</p>
              <p className="info-text">📁 Check your spam folder if you don't see it</p>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p>
            <Link to="/login" className="back-link">← Back to Login</Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default ForgotPassword;