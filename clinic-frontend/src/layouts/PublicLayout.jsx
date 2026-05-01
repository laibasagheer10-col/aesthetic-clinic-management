import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

function PublicLayout() {
  const location = useLocation();
  
  console.log("🔵 PublicLayout rendering - Current path:", location.pathname);
  console.log("🔵 PublicLayout - Auth check:", {
    token: !!localStorage.getItem("token"),
    user: !!localStorage.getItem("user")
  });

  return (
    <div className="public-layout" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#f8f9fa'
    }}>
      <Navbar />
      
      {/* Page Transitions */}
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{ 
            flex: 1,
  
            position: 'relative'
          }}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default PublicLayout;