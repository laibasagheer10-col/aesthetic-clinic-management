import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./auth.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Valid email is required";
    }

    if (!formData.phone.match(/^\d{10}$/)) {
      newErrors.phone = "Valid 10-digit phone number is required";
    }

    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Send only required fields (same as login pattern)
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });

      console.log('Registration response:', response.data); // For debugging

      // ✅ Check response structure (similar to login)
      const responseData = response.data;
      
      // Your backend returns success and user directly
      if (responseData.success) {
        toast.success('Registration successful! Please login.');
        
        // Redirect to login page after successful registration
        navigate('/login');
      } else {
        toast.error(responseData.message || 'Registration failed');
      }

    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed';
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
      <div className="auth-card register-card">
        <motion.div 
          className="auth-header"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
        >
          <h1>Create Account 📝</h1>
          <p>Join our clinic family</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="auth-form">
          <motion.div 
            className="form-group"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.name ? 'error' : ''}
              required
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </motion.div>

          <motion.div 
            className="form-group"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </motion.div>

          <motion.div 
            className="form-group"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              className={errors.phone ? 'error' : ''}
              required
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </motion.div>

          <motion.div 
            className="form-group"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className={errors.password ? 'error' : ''}
              required
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </motion.div>

          <motion.div 
            className="form-group"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              className={errors.confirmPassword ? 'error' : ''}
              required
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </motion.div>

          <motion.div 
            className="form-group checkbox-group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <label className="checkbox">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              I agree to the <Link to="/terms">Terms & Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
            </label>
            {errors.agreeTerms && <span className="error-text">{errors.agreeTerms}</span>}
          </motion.div>

          <motion.button
            type="submit"
            className="auth-btn"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </motion.button>
        </form>

        <motion.div 
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Register;