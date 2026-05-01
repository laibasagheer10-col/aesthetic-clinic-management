import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./admin.css";
import NotificationBell from "../components/admin/NotificationBell";
import api from "../services/api";
import toast from "react-hot-toast";

function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contentDropdownOpen, setContentDropdownOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const navItems = [
    { path: "/admin", icon: "📊", label: "Dashboard" },
    { path: "/admin/patients", icon: "👥", label: "Patients" },
    { path: "/admin/appointments", icon: "📅", label: "Appointments" },
    { path: "/admin/finance", icon: "💰", label: "Finance" },
    { path: "/admin/inventory", icon: "📦", label: "Inventory" },
    { path: "/admin/users", icon: "👤", label: "Users" },
    { path: "/admin/settings", icon: "⚙️", label: "Settings" }
  ];

  const contentItems = [
    { path: "/admin/services", icon: "💆", label: "Services" },
    { path: "/admin/gallery", icon: "🖼️", label: "Gallery" },
    { path: "/admin/blogs", icon: "📝", label: "Blogs" },
    { path: "/admin/testimonials", icon: "⭐", label: "Testimonials" }
  ];

  return (
    <div className={`layout ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>

      {/* SIDEBAR */}
      <motion.div
        className="sidebar"
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        style={{
          width: sidebarCollapsed ? "80px" : "280px",
          height: "100vh",
          position: "fixed",
          background: "#1a1f3c",
          color: "white",
          display: "flex",
          flexDirection: "column"
        }}
      >

        {/* HEADER */}
        <div style={{
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}>
          {!sidebarCollapsed && (
            <div>
              <h2 style={{ margin: 0 }}>Clinic Admin</h2>

              {user && (
                <div style={{ marginTop: "5px" }}>
                  <div style={{ fontSize: "13px" }}>{user.name}</div>
                  <div style={{ fontSize: "11px", opacity: 0.7 }}>{user.role}</div>
                </div>
              )}
            </div>
          )}

          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? "→" : "←"}
          </button>
        </div>

        {/* NAVIGATION */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
          <nav>

            {navItems.map(item => (
              <Link key={item.path} to={item.path} className="nav-link"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  padding: "12px 15px",
                  borderRadius: "8px",
                  marginBottom: "5px",
                  color: "white",
                  textDecoration: "none",
                  justifyContent: sidebarCollapsed ? "center" : "flex-start"
                }}>
                <span>{item.icon}</span>
                {!sidebarCollapsed && item.label}
              </Link>
            ))}

            {/* CONTENT DROPDOWN */}
            <div
              onClick={() => !sidebarCollapsed && setContentDropdownOpen(!contentDropdownOpen)}
              className="nav-link"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "12px 15px",
                borderRadius: "8px",
                marginBottom: "5px",
                cursor: "pointer",
                justifyContent: sidebarCollapsed ? "center" : "flex-start"
              }}
            >
              <span>📋</span>
              {!sidebarCollapsed && (
                <>
                  <span>Content</span>
                  <span style={{ marginLeft: "auto" }}>
                    {contentDropdownOpen ? "▼" : "▶"}
                  </span>
                </>
              )}
            </div>

            {contentDropdownOpen && !sidebarCollapsed && (
              <div style={{ paddingLeft: "20px" }}>
                {contentItems.map(item => (
                  <Link key={item.path} to={item.path} className="nav-link"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 15px",
                      borderRadius: "8px",
                      marginBottom: "3px",
                      color: "white",
                      textDecoration: "none",
                      fontSize: "13px",
                      opacity: 0.9
                    }}>
                    {item.icon} {item.label}
                  </Link>
                ))}
              </div>
            )}

          </nav>
        </div>

        {/* LOGOUT */}
        <div style={{
          padding: "15px",
          borderTop: "1px solid rgba(255,255,255,0.1)"
        }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "12px",
              fontWeight: "bold",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            🚪 {!sidebarCollapsed && "Logout"}
          </button>
        </div>

      </motion.div>

      {/* MAIN */}
      <div className="main" style={{
        marginLeft: sidebarCollapsed ? "80px" : "280px",
        background: "#f5f7fa",
        minHeight: "100vh"
      }}>

        {/* HEADER */}
        <div style={{
          background: "white",
          padding: "15px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>
            Welcome back, <b>{user?.name || "Admin"}</b>
          </span>

          <NotificationBell />
        </div>

        {/* CONTENT */}
        <div style={{ padding: "25px" }}>
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default AdminLayout;