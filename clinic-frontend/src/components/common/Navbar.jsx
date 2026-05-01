import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Navbar.css";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { to: "/", label: "HOME" },
    { to: "/about", label: "ABOUT" },
    { to: "/services", label: "SERVICES" },
    { to: "/gallery", label: "GALLERY" },
    { to: "/before-after", label: "RESULTS" },
    { to: "/blogs", label: "BLOG" },
    { to: "/contact", label: "CONTACT" },
  ];

  return (
    <motion.nav 
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="nav-container">
        {/* Logo with Stethoscope Icon */}
        <Link to="/" className="logo">
          <motion.div 
            className="logo-wrapper"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Stethoscope Icon */}
            <div className="logo-icon-wrapper">
              <svg 
                className="stethoscope-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M12 2C8.13 2 5 5.13 5 9v1c0 3.87 3.13 7 7 7s7-3.13 7-7V9c0-3.87-3.13-7-7-7z" 
                  fill="currentColor"
                />
                <path 
                  d="M17 12c0 2.76-2.24 5-5 5s-5-2.24-5-5" 
                  stroke="white" 
                  strokeWidth="2" 
                  fill="none"
                />
                <path 
                  d="M19 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" 
                  fill="currentColor"
                />
              </svg>
            </div>
            
            <div className="logo-text-wrapper">
              <span className="logo-text-main">Aesthetics by</span>
              <span className="logo-text-name">Dr. Hira Iftikhar</span>
            </div>
          </motion.div>
        </Link>

        {/* Desktop Menu */}
        <div className="nav-menu desktop-menu">
          {navLinks.map((item) => (
            <motion.div
              key={item.to}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to={item.to} 
                className={`nav-link ${location.pathname === item.to ? 'active' : ''}`}
              >
                {item.label}
                {location.pathname === item.to && (
                  <motion.div 
                    className="active-indicator"
                    layoutId="activeNav"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="nav-actions">
          <motion.button
            className="btn-appointment"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/register'}
          >
            GET APPOINTMENT
          </motion.button>

          {/* Mobile Menu Button */}
          <motion.button
            className="mobile-menu-btn"
            whileTap={{ scale: 0.9 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navLinks.map((item, index) => (
              <motion.div
                key={item.to}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link 
                  to={item.to} 
                  className={`mobile-nav-link ${location.pathname === item.to ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ padding: '10px 20px' }}
            >
              <button 
                className="mobile-appointment-btn"
                onClick={() => {
                  window.location.href = '/register';
                  setMobileMenuOpen(false);
                }}
              >
                GET APPOINTMENT
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;