import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import "./user.css";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("user"));
      const res = await api.get(`/users/${userData.id}`);
      setUser(res.data);
      setFormData(res.data);
    } catch (error) {
      // Fallback to localStorage if API fails
      const userData = JSON.parse(localStorage.getItem("user"));
      setUser(userData);
      setFormData(userData);
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, profileImage: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSaving(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const res = await api.put(`/users/${userData.id}`, formData);
      
      // Update localStorage
      const updatedUser = { ...userData, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setUser(res.data);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="user-profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="page-header">
        <h1>👤 My Profile</h1>
        {!isEditing && (
          <motion.button
            className="edit-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
          >
            ✏️ Edit Profile
          </motion.button>
        )}
      </div>

      <div className="profile-container">
        {/* Profile Avatar Section */}
        <motion.div
          className="profile-avatar-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="avatar-container">
            {formData.profileImage ? (
              <img src={formData.profileImage} alt={formData.name} className="profile-img" />
            ) : (
              <div className="avatar-placeholder">
                {formData.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            {isEditing && (
              <label className="avatar-upload">
                📷 Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          className="profile-info-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {!isEditing ? (
            <div className="profile-display">
              <div className="info-card">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{formData.name || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{formData.email || "Not provided"}</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-item">
                  <label>Phone Number</label>
                  <p>{formData.phone || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Date of Birth</label>
                  <p>
                    {formData.dateOfBirth
                      ? new Date(formData.dateOfBirth).toLocaleDateString("en-PK")
                      : "Not provided"}
                  </p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-item">
                  <label>Gender</label>
                  <p>{formData.gender || "Not provided"}</p>
                </div>
                <div className="info-item">
                  <label>Blood Type</label>
                  <p>{formData.bloodType || "Not provided"}</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-item full-width">
                  <label>Address</label>
                  <p>{formData.address || "Not provided"}</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-item full-width">
                  <label>Medical History</label>
                  <p>{formData.medicalHistory || "Not provided"}</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-item">
                  <label>Account Status</label>
                  <p style={{ color: formData.isActive ? "#4CAF50" : "#f44336" }}>
                    {formData.isActive ? "✓ Active" : "✗ Inactive"}
                  </p>
                </div>
                <div className="info-item">
                  <label>Member Since</label>
                  <p>
                    {formData.createdAt
                      ? new Date(formData.createdAt).toLocaleDateString("en-PK")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form className="profile-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={
                        formData.dateOfBirth
                          ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Blood Type</label>
                    <select
                      name="bloodType"
                      value={formData.bloodType || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Blood Type</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Address</h3>
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={formData.address || ""}
                    onChange={handleInputChange}
                    placeholder="Enter your full address"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Medical Information</h3>
                <div className="form-group full-width">
                  <label>Medical History</label>
                  <textarea
                    name="medicalHistory"
                    value={formData.medicalHistory || ""}
                    onChange={handleInputChange}
                    placeholder="Enter any relevant medical history or allergies"
                    rows="4"
                  />
                </div>
              </div>

              <div className="form-actions">
                <motion.button
                  type="button"
                  className="save-btn"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </motion.button>
                <motion.button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(user);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Profile;
