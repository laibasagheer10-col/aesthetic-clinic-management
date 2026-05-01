const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(verifyToken);

// Profile routes (must come before /:id)
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);

// User management routes
router.get('/', authorizeRoles('SuperAdmin', 'Admin'), userController.getAllUsers);
router.post('/', authorizeRoles('SuperAdmin', 'Admin'), userController.createUser);
router.get('/:id', authorizeRoles('SuperAdmin', 'Admin'), userController.getUserById);
router.put('/:id', authorizeRoles('SuperAdmin', 'Admin'), userController.updateUser);
router.put('/:id/status', authorizeRoles('SuperAdmin', 'Admin'), userController.updateUserStatus);
router.delete('/:id', authorizeRoles('SuperAdmin'), userController.deleteUser);

module.exports = router;