const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { superAdminOnly } = require('../middleware/roleMiddleware');
const { auditLog } = require('../middleware/auditMiddleware');
const {
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getAuditLogs,
  getRoles,
  updateRolePermissions
} = require('../controllers/adminController');

// All routes require SuperAdmin access
router.use(verifyToken);
router.use(superAdminOnly);

// User management
router.get('/users', auditLog('VIEW_USERS'), getAllUsers);
router.put('/users/:id/role', auditLog('UPDATE_USER'), updateUserRole);
router.put('/users/:id/toggle-status', auditLog('TOGGLE_USER_STATUS'), toggleUserStatus);
router.delete('/users/:id', auditLog('DELETE_USER'), deleteUser);

// Audit logs
router.get('/audit-logs', auditLog('VIEW_AUDIT_LOGS'), getAuditLogs);

// Role management
router.get('/roles', auditLog('VIEW_ROLES'), getRoles);
router.put('/roles/:id', auditLog('UPDATE_ROLE'), updateRolePermissions);

module.exports = router;