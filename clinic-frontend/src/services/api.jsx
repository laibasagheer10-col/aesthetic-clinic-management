import axios from "axios";
import toast from "react-hot-toast";

// ✅ FIX: Use import.meta.env instead of process.env for Vite
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BASE_URL = API_URL.replace('/api', ''); // Remove /api to get base URL

console.log("🔧 API Configuration:", { API_URL, BASE_URL });

// ✅ IMAGE URL HELPER - Centralized image URL construction
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.warn("🖼️ Warning: imagePath is empty/null");
    return null;
  }

  // Already a full URL
  if (imagePath.startsWith('http')) {
    console.log("✅ Already full URL:", imagePath);
    return imagePath;
  }

  // Normalize file path separators and remove extra /uploads segments.
  let normalizedPath = imagePath.replace(/\\/g, '/').trim();
  normalizedPath = normalizedPath.replace(/^\/?uploads\/uploads\//, 'uploads/');
  normalizedPath = normalizedPath.replace(/^\/?uploads\//, '/uploads/');
  normalizedPath = normalizedPath.replace(/^\//, '');

  // Ensure this path is /uploads/... at minimum.
  if (!normalizedPath.startsWith('uploads/')) {
    normalizedPath = `uploads/${normalizedPath}`;
  }

  // Always keep leading slash for URL building.
  normalizedPath = '/' + normalizedPath;

  const fullUrl = `${BASE_URL}${normalizedPath}`;
  console.log("🖼️ Image URL normalized:", imagePath, "→", fullUrl);
  return fullUrl;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// 🔐 Request Interceptor - Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ FIX: Use import.meta.env.DEV for Vite development check
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 📦 Response Interceptor - Handle Responses
api.interceptors.response.use(
  (response) => {
    // ✅ FIX: Use import.meta.env.DEV for Vite development check
    if (import.meta.env.DEV) {
      console.log('✅ Response:', response.data);
    }
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      // ✅ FIX: Use import.meta.env.DEV for Vite development check
      if (import.meta.env.DEV) {
        console.error('❌ Error:', status, data);
      }

      // Handle specific status codes
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (!window.location.pathname.includes('/login')) {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action.');
          break;

        case 404:
          // Not found
          toast.error('Resource not found.');
          break;

        case 422:
          // Validation error
          toast.error(data.message || 'Validation failed.');
          break;

        case 429:
          // Too many requests
          toast.error('Too many requests. Please try again later.');
          break;

        case 500:
          // Server error
          toast.error('Server error. Please try again later.');
          break;

        default:
          // Other errors
          toast.error(data.message || 'An error occurred.');
      }
    } else if (error.request) {
      // Request made but no response
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

// 🔧 Helper methods for common operations
export const apiService = {
  // Auth
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),

  // Patients
  getPatients: () => api.get('/patients'),
  getPatient: (id) => api.get(`/patients/${id}`),
  createPatient: (data) => api.post('/patients', data),
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/patients/${id}`),

  // Appointments
  getAppointments: () => api.get('/appointments'),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  createAppointment: (data) => api.post('/appointments', data),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),

  // Payments
  getPayments: () => api.get('/payments'),
  createPayment: (data) => api.post('/payments', data),

  // Expenses
  getExpenses: () => api.get('/expenses'),
  createExpense: (data) => api.post('/expenses', data),

  // Inventory
  getInventory: () => api.get('/inventory'),
  createInventoryItem: (data) => api.post('/inventory', data),
  updateInventoryItem: (id, data) => api.put(`/inventory/${id}`, data),

  // Dashboard
  getDashboardStats: () => api.get('/dashboard/stats'),
  getFullDashboard: () => api.get('/dashboard/full'),

  // Notifications
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => api.put('/notifications/read-all'),

  // Users (Admin only)
  getUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Reports
  getReports: (params) => api.get('/reports', { params }),
  exportReport: (format, params) => api.get(`/reports/export/${format}`, { 
    params,
    responseType: 'blob' 
  }),
};

export default api;