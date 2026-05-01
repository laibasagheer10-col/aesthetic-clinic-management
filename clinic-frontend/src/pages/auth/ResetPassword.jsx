import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./auth.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      console.log('Sending reset password request with token:', token);
      
      const response = await api.put(`/auth/reset-password/${token}`, {
        password: formData.password
      });

      console.log('Reset password response:', response.data);

      if (response.data.success) {
        toast.success('Password reset successful!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
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
          <h1>Set New Password 🔒</h1>
          <p>Enter your new password below</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="auth-form">
          <motion.div 
            className="form-group"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <label>New Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className={errors.password ? 'error' : ''}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </motion.div>

          <motion.div 
            className="form-group"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <label>Confirm New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              className={errors.confirmPassword ? 'error' : ''}
              required
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
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
            {loading ? 'Resetting...' : 'Reset Password'}
          </motion.button>
        </form>

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

export default ResetPassword;