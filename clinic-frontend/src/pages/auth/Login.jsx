import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./auth.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      console.log('Sending login request...');
      
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      console.log('Login response:', response.data);

      // Check if response was successful
      if (!response.data.success) {
        toast.error(response.data.message || 'Login failed');
        return;
      }

      // Extract token and user from root level
      const token = response.data.token;
      const user = response.data.user;

      console.log('Token extracted:', token ? 'Yes ✅' : 'No ❌');
      console.log('User extracted:', user ? 'Yes ✅' : 'No ❌');
      console.log('User role:', user?.role);

      if (!token) {
        toast.error('No token received from server');
        return;
      }

      if (!user) {
        toast.error('No user data received');
        return;
      }

      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Set default axios header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      toast.success('Login successful!');

      // ✅ CORRECTED: Redirect based on role using your existing routes
      if (user.role === 'Admin' || user.role === 'SuperAdmin') {
        console.log('Redirecting to admin dashboard');
        navigate('/admin');
      } else {
        console.log('Redirecting to user dashboard');
        navigate('/user'); // All other roles (Patient, Doctor, etc.) go to /user
      }

    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
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
          <h1>Welcome Back! 👋</h1>
          <p>Login to your account</p>
        </motion.div>

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
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={errors.password ? 'error' : ''}
              required
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </motion.div>

          <motion.div 
            className="form-options"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <label className="checkbox">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
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
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        <motion.div 
          className="auth-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>Don't have an account? <Link to="/register">Register</Link></p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Login;