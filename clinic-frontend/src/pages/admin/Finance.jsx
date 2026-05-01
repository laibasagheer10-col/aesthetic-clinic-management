import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Payments from "./Payments";

function Finance() {
  const [activeTab, setActiveTab] = useState('payments');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    successfulTransactions: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatPKR = (amount) => {
    return `₨${amount.toLocaleString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: "20px" }}
    >
      <h1 style={{ marginBottom: "20px" }}>💰 Finance Dashboard</h1>

      {/* Summary Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}>
        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          style={{
            padding: "25px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "15px",
            color: "white",
            boxShadow: "0 10px 30px rgba(102, 126, 234, 0.3)"
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>
            Total Revenue (All Time)
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>
            {formatPKR(stats.totalRevenue)}
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          style={{
            padding: "25px",
            background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
            borderRadius: "15px",
            color: "white",
            boxShadow: "0 10px 30px rgba(253, 160, 133, 0.3)"
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>
            This Month Revenue
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>
            {formatPKR(stats.monthlyRevenue)}
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          style={{
            padding: "25px",
            background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
            borderRadius: "15px",
            color: "white",
            boxShadow: "0 10px 30px rgba(132, 250, 176, 0.3)"
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>
            Today's Revenue
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>
            {formatPKR(stats.todayRevenue)}
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -5 }}
          style={{
            padding: "25px",
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            borderRadius: "15px",
            color: "white",
            boxShadow: "0 10px 30px rgba(240, 147, 251, 0.3)"
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "10px" }}>
            Pending Amount
          </div>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>
            {formatPKR(stats.pendingAmount)}
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        marginBottom: "20px",
        borderBottom: "2px solid #eee",
        paddingBottom: "10px"
      }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('payments')}
          style={{
            padding: "10px 20px",
            background: activeTab === 'payments' ? "#2196F3" : "white",
            color: activeTab === 'payments' ? "white" : "#333",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: activeTab === 'payments' ? "0 4px 10px rgba(33, 150, 243, 0.3)" : "none"
          }}
        >
          💵 Payments
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('invoices')}
          style={{
            padding: "10px 20px",
            background: activeTab === 'invoices' ? "#4CAF50" : "white",
            color: activeTab === 'invoices' ? "white" : "#333",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: activeTab === 'invoices' ? "0 4px 10px rgba(76, 175, 80, 0.3)" : "none"
          }}
        >
          📄 Invoices
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('reports')}
          style={{
            padding: "10px 20px",
            background: activeTab === 'reports' ? "#FF9800" : "white",
            color: activeTab === 'reports' ? "white" : "#333",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: activeTab === 'reports' ? "0 4px 10px rgba(255, 152, 0, 0.3)" : "none"
          }}
        >
          📊 Reports
        </motion.button>
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: "400px" }}>
        {activeTab === 'payments' && <Payments />}
        {activeTab === 'invoices' && <Invoices />}
        {activeTab === 'reports' && <FinanceReports />}
      </div>
    </motion.div>
  );
}

// Invoices Component
function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (error) {
      toast.error('Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const downloadInvoice = async (id) => {
    try {
      const response = await api.get(`/invoices/${id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>📄 Invoices</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderStyle}>
                <th style={thStyle}>Invoice #</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Patient</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id}>
                  <td style={tdStyle}>{inv.invoiceNumber}</td>
                  <td style={tdStyle}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td style={tdStyle}>{inv.patientId?.name || 'N/A'}</td>
                  <td style={tdStyle}>₨{inv.total.toLocaleString()}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: "4px 8px",
                      background: inv.status === 'Paid' ? '#4CAF50' : 
                                 inv.status === 'Sent' ? '#2196F3' : '#FF9800',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => downloadInvoice(inv._id)}
                      style={{
                        padding: "5px 10px",
                        background: "#2196F3",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer"
                      }}
                    >
                      📥 Download PDF
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Finance Reports Component
function FinanceReports() {
  return (
    <div>
      <h2>📊 Financial Reports</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>Coming soon...</p>
    </div>
  );
}

// Styles
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "white",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
};

const tableHeaderStyle = {
  background: "#f5f5f5"
};

const thStyle = {
  padding: "12px",
  textAlign: "left",
  fontWeight: "bold"
};

const tdStyle = {
  padding: "12px",
  borderBottom: "1px solid #eee"
};

export default Finance;