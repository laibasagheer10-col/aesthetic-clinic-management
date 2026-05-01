import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

function Inventory() {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editSupplier, setEditSupplier] = useState(null);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalStock: 0,
    totalValue: 0,
    lowStockItems: 0,
    expiredItems: 0
  });

  // CORRECTED: Using database field names
  const [form, setForm] = useState({
    productName: "",        // Changed from name to productName
    category: "",
    stockQuantity: "",      // Changed from quantity to stockQuantity
    sellingPrice: "",       // Changed from price to sellingPrice
    purchasePrice: "",
    supplierId: "",
    expiryDate: "",
    lowStockAlert: "10",
    notes: ""
  });

  // CORRECTED: Using database field names for supplier
  const [supplierForm, setSupplierForm] = useState({
    supplierName: "",       // This is the primary field in DB
    contact: "",
    company: "",
    address: ""
    // Removed: name, phone, email, taxId, paymentTerms, notes (not in DB schema)
  });

  // Fetch inventory items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/inventory");
      setItems(res.data);
    } catch (error) {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data);
    } catch (error) {
      console.error("Failed to fetch suppliers");
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const res = await api.get("/inventory/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats");
    }
  };

  useEffect(() => {
    fetchItems();
    fetchSuppliers();
    fetchStats();
  }, []);

  // Handle inventory submit - CORRECTED field names
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.productName) {
      return toast.error("Product name is required");
    }

    try {
      const itemData = {
        productName: form.productName,
        category: form.category || 'General',
        stockQuantity: parseInt(form.stockQuantity) || 0,
        sellingPrice: parseFloat(form.sellingPrice) || 0,
        purchasePrice: parseFloat(form.purchasePrice) || 0,
        supplierId: form.supplierId || null,
        expiryDate: form.expiryDate || null,
        lowStockAlert: parseInt(form.lowStockAlert) || 10,
        notes: form.notes || ''
      };

      if (editData) {
        await api.put(`/inventory/${editData._id}`, itemData);
        toast.success("Item updated ✅");
      } else {
        await api.post("/inventory", itemData);
        toast.success("Item added ✅");
      }
      
      fetchItems();
      fetchStats();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.error || "Operation failed ❌");
    }
  };

  // Handle supplier submit - CORRECTED to match DB schema
  const handleSupplierSubmit = async (e) => {
    e.preventDefault();
    
    const supplierName = supplierForm.supplierName;
    
    if (!supplierName) {
      return toast.error("Supplier name is required");
    }

    try {
      const supplierData = {
        supplierName: supplierName,
        contact: supplierForm.contact || '',
        company: supplierForm.company || '',
        address: supplierForm.address || ''
      };

      if (editSupplier) {
        await api.put(`/suppliers/${editSupplier._id}`, supplierData);
        toast.success("Supplier updated ✅");
      } else {
        await api.post("/suppliers", supplierData);
        toast.success("Supplier added ✅");
      }
      
      fetchSuppliers();
      setSupplierModalOpen(false);
      resetSupplierForm();
    } catch (error) {
      toast.error(error.response?.data?.error || "Operation failed ❌");
    }
  };

  const resetForm = () => {
    setForm({
      productName: "",
      category: "",
      stockQuantity: "",
      sellingPrice: "",
      purchasePrice: "",
      supplierId: "",
      expiryDate: "",
      lowStockAlert: "10",
      notes: ""
    });
    setEditData(null);
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      supplierName: "",
      contact: "",
      company: "",
      address: ""
    });
    setEditSupplier(null);
  };

  const openEditModal = (item) => {
    setEditData(item);
    setForm({
      productName: item.productName || "",
      category: item.category || "",
      stockQuantity: item.stockQuantity || "",
      sellingPrice: item.sellingPrice || "",
      purchasePrice: item.purchasePrice || "",
      supplierId: item.supplierId?._id || item.supplierId || "",
      expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : "",
      lowStockAlert: item.lowStockAlert || "10",
      notes: item.notes || ""
    });
    setModalOpen(true);
  };

  const openEditSupplierModal = (supplier) => {
    setEditSupplier(supplier);
    setSupplierForm({
      supplierName: supplier.supplierName || "",
      contact: supplier.contact || "",
      company: supplier.company || "",
      address: supplier.address || ""
    });
    setSupplierModalOpen(true);
  };

  const addStock = async (itemId) => {
    const quantity = prompt("Enter quantity to add:", "1");
    if (!quantity) return;
    
    try {
      await api.post(`/inventory/${itemId}/add-stock`, { 
        quantity: parseInt(quantity),
        notes: "Manual stock addition"
      });
      toast.success("Stock added ✅");
      fetchItems();
      fetchStats();
    } catch (error) {
      toast.error("Failed to add stock");
    }
  };

  const getSupplierName = (supplierId) => {
    if (!supplierId) return "No Supplier";
    const supplier = suppliers.find(s => s._id === (supplierId._id || supplierId));
    return supplier?.supplierName || "Unknown";
  };

  const formatCurrency = (value) => {
    return `₨${value.toLocaleString()}`;
  };

  // Check low stock
  const isLowStock = (quantity, alertLevel = 10) => {
    return quantity < alertLevel;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: "20px" }}
    >
      {/* Header with Actions */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <h1>📦 Inventory Management</h1>
        <div style={{ display: "flex", gap: "10px" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetSupplierForm();
              setSupplierModalOpen(true);
            }}
            style={{
              padding: "10px 20px",
              background: "#FF9800",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            + Add Supplier
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            style={{
              padding: "10px 20px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            + Add Product
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}>
        <motion.div whileHover={{ scale: 1.02 }} style={styles.card}>
          <div style={styles.cardIcon}>📦</div>
          <h3 style={styles.cardTitle}>Total Products</h3>
          <p style={styles.cardValue}>{stats.totalItems}</p>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} style={styles.card}>
          <div style={styles.cardIcon}>📊</div>
          <h3 style={styles.cardTitle}>Total Stock</h3>
          <p style={styles.cardValue}>{stats.totalStock}</p>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} style={styles.card}>
          <div style={styles.cardIcon}>💰</div>
          <h3 style={styles.cardTitle}>Total Value</h3>
          <p style={styles.cardValue}>{formatCurrency(stats.totalValue)}</p>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} style={{ ...styles.card, borderLeft: "4px solid #f44336" }}>
          <div style={styles.cardIcon}>⚠️</div>
          <h3 style={styles.cardTitle}>Low Stock</h3>
          <p style={{ ...styles.cardValue, color: "#f44336" }}>{stats.lowStockItems}</p>
        </motion.div>
      </div>

      {/* Suppliers Section */}
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ marginBottom: "15px" }}>🏢 Suppliers</h2>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "15px"
        }}>
          {suppliers.map(supplier => (
            <motion.div
              key={supplier._id}
              whileHover={{ scale: 1.02, y: -2 }}
              style={styles.supplierCard}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <h3 style={{ margin: "0 0 5px 0" }}>{supplier.supplierName}</h3>
                  <p style={{ margin: "0", color: "#666", fontSize: "13px" }}>
                    {supplier.contact || "No contact"}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openEditSupplierModal(supplier)}
                  style={styles.editButton}
                >
                  ✏️
                </motion.button>
              </div>
              
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginTop: "10px",
                fontSize: "12px"
              }}>
                <div>
                  <div style={{ color: "#666" }}>Products</div>
                  <div style={{ fontWeight: "bold" }}>
                    {items.filter(item => 
                      item.supplierId?._id === supplier._id || item.supplierId === supplier._id
                    ).length}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#666" }}>Company</div>
                  <div style={{ fontWeight: "bold" }}>{supplier.company || "N/A"}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={styles.loader} />
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Supplier</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <motion.tr 
                  key={item._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={styles.tableRow}
                >
                  <td style={styles.td}>
                    <div style={{ fontWeight: "bold" }}>{item.productName}</div>
                    {item.notes && <small style={{ color: "#666" }}>{item.notes}</small>}
                  </td>
                  <td style={styles.td}>{item.category || "General"}</td>
                  <td style={styles.td}>
                    <span style={{
                      color: isLowStock(item.stockQuantity, item.lowStockAlert) ? "#f44336" : "inherit",
                      fontWeight: isLowStock(item.stockQuantity, item.lowStockAlert) ? "bold" : "normal"
                    }}>
                      {item.stockQuantity || 0}
                    </span>
                  </td>
                  <td style={styles.td}>{formatCurrency(item.sellingPrice || 0)}</td>
                  <td style={styles.td}>
                    {item.supplierId ? (
                      <span style={{
                        padding: "4px 8px",
                        background: "#e3f2fd",
                        borderRadius: "4px",
                        fontSize: "12px"
                      }}>
                        {item.supplierId.supplierName || "Unknown"}
                      </span>
                    ) : "No Supplier"}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      background: isLowStock(item.stockQuantity, item.lowStockAlert) ? "#ffebee" : "#e8f5e8",
                      color: isLowStock(item.stockQuantity, item.lowStockAlert) ? "#f44336" : "#4CAF50"
                    }}>
                      {isLowStock(item.stockQuantity, item.lowStockAlert) ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addStock(item._id)}
                        style={{ ...styles.actionButton, background: "#4CAF50" }}
                        title="Add Stock"
                      >
                        ➕
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(item)}
                        style={{ ...styles.actionButton, background: "#2196F3" }}
                        title="Edit"
                      >
                        ✏️
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Modal */}
      {modalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.modalOverlay}
          onClick={() => setModalOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            style={styles.modalContent}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={styles.modalTitle}>
              {editData ? "✏️ Edit Product" : "➕ Add New Product"}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Product Name *</label>
                  <input
                    type="text"
                    value={form.productName}
                    onChange={(e) => setForm({...form, productName: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    style={styles.input}
                    placeholder="e.g., Medicines, Equipment"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantity *</label>
                  <input
                    type="number"
                    value={form.stockQuantity}
                    onChange={(e) => setForm({...form, stockQuantity: e.target.value})}
                    style={styles.input}
                    required
                    min="0"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Selling Price (₨) *</label>
                  <input
                    type="number"
                    value={form.sellingPrice}
                    onChange={(e) => setForm({...form, sellingPrice: e.target.value})}
                    style={styles.input}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Purchase Price (₨)</label>
                  <input
                    type="number"
                    value={form.purchasePrice}
                    onChange={(e) => setForm({...form, purchasePrice: e.target.value})}
                    style={styles.input}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Low Stock Alert</label>
                  <input
                    type="number"
                    value={form.lowStockAlert}
                    onChange={(e) => setForm({...form, lowStockAlert: e.target.value})}
                    style={styles.input}
                    min="1"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Supplier</label>
                  <select
                    value={form.supplierId}
                    onChange={(e) => setForm({...form, supplierId: e.target.value})}
                    style={styles.input}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.supplierName}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Expiry Date</label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({...form, expiryDate: e.target.value})}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  style={{ ...styles.input, minHeight: "60px" }}
                  placeholder="Additional notes..."
                />
              </div>

              <div style={styles.buttonGroup}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  style={{ ...styles.button, background: "#f44336" }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ ...styles.button, background: "#4CAF50" }}
                >
                  {editData ? "Update" : "Save"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Supplier Modal */}
      {supplierModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.modalOverlay}
          onClick={() => setSupplierModalOpen(false)}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            style={styles.modalContent}
            onClick={e => e.stopPropagation()}
          >
            <h2 style={styles.modalTitle}>
              {editSupplier ? "✏️ Edit Supplier" : "➕ Add New Supplier"}
            </h2>
            
            <form onSubmit={handleSupplierSubmit}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Supplier Name *</label>
                  <input
                    type="text"
                    value={supplierForm.supplierName}
                    onChange={(e) => setSupplierForm({...supplierForm, supplierName: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Contact Person</label>
                  <input
                    type="text"
                    value={supplierForm.contact}
                    onChange={(e) => setSupplierForm({...supplierForm, contact: e.target.value})}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Company</label>
                  <input
                    type="text"
                    value={supplierForm.company}
                    onChange={(e) => setSupplierForm({...supplierForm, company: e.target.value})}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Address</label>
                  <input
                    type="text"
                    value={supplierForm.address}
                    onChange={(e) => setSupplierForm({...supplierForm, address: e.target.value})}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.buttonGroup}>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSupplierModalOpen(false);
                    resetSupplierForm();
                  }}
                  style={{ ...styles.button, background: "#f44336" }}
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ ...styles.button, background: "#4CAF50" }}
                >
                  {editSupplier ? "Update" : "Save"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Styles (keep your existing styles - they're perfect)
const styles = {
  card: {
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    position: "relative",
    overflow: "hidden"
  },
  cardIcon: {
    position: "absolute",
    right: "20px",
    top: "20px",
    fontSize: "40px",
    opacity: 0.1
  },
  cardTitle: {
    margin: "0 0 10px 0",
    color: "#666",
    fontSize: "14px",
    textTransform: "uppercase",
    letterSpacing: "1px"
  },
  cardValue: {
    margin: "0",
    fontSize: "28px",
    fontWeight: "bold",
    color: "#333"
  },
  supplierCard: {
    padding: "15px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    cursor: "pointer"
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
  },
  tableHeader: {
    background: "#f5f5f5"
  },
  th: {
    padding: "15px",
    textAlign: "left",
    fontWeight: "bold",
    color: "#333"
  },
  tableRow: {
    borderBottom: "1px solid #eee",
    transition: "background 0.3s",
    cursor: "pointer"
  },
  td: {
    padding: "15px"
  },
  actionButton: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px"
  },
  editButton: {
    padding: "4px 8px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
  },
  modalContent: {
    background: "white",
    padding: "30px",
    borderRadius: "16px",
    width: "600px",
    maxWidth: "95%",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  modalTitle: {
    margin: "0 0 20px 0",
    color: "#333"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
    marginBottom: "15px"
  },
  formGroup: {
    marginBottom: "15px"
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#333"
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "20px"
  },
  button: {
    padding: "12px 24px",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold"
  },
  loader: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #2196F3",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto"
  }
};

export default Inventory;