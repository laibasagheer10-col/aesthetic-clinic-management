import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
//import NotificationBell from "../components/user/NotificationBell";
import api from "../services/api";
import toast from "react-hot-toast";
import "./user.css";

function UserLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const menuItems = [
    { path: "/user", icon: "📊", label: "Dashboard" },
    { path: "/user/book-appointment", icon: "📅", label: "Book Appointment" },
    { path: "/user/my-appointments", icon: "📋", label: "My Appointments" },
    { path: "/user/payments", icon: "💰", label: "Payments" },
    { path: "/user/profile", icon: "👤", label: "Profile" },
    // { path: "/user/notifications", icon: "🔔", label: "Notifications" } // Commented out
  ];

  return (
    <div className={`user-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <motion.div 
        className="user-sidebar"
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        style={{
          width: sidebarCollapsed ? '80px' : '280px'
        }}
      >
        <div className="sidebar-header">
          {!sidebarCollapsed && <h2>Patient Portal</h2>}
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {user && !sidebarCollapsed && (
          <div className="user-info">
            <div className="user-avatar">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} />
              ) : (
                <span>{user.name?.charAt(0)}</span>
              )}
            </div>
            <div className="user-details">
              <h4>{user.name}</h4>
              <p>{user.email}</p>
            </div>
          </div>
        )}

        <nav className="user-nav">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                to={item.path}
                className="nav-link"
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            </motion.div>
          ))}
        </nav>

        <button onClick={handleLogout} className="logout-btn">
          <span>🚪</span>
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="user-main" style={{
        marginLeft: sidebarCollapsed ? '80px' : '280px'
      }}>
        {/* Top Bar */}
        <div className="top-bar">
          <div className="page-title">
            <h2>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
          </div>
          <div className="top-bar-actions">
            {/* <NotificationBell /> */} {/* ✅ CORRECTLY COMMENTED OUT */}
          </div>
        </div>

        {/* Page Content */}
        <div className="user-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default UserLayout;