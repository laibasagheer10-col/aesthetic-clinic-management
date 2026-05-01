const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  registerUser, 
  loginUser, 
  logoutUser,
  getCurrentUser 
} = require('../controllers/authController');
const { 
  forgotPassword, 
  resetPassword 
} = require('../controllers/forgotPasswordController');
const { verifyToken } = require('../middleware/authMiddleware');

// Validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required')
];

const resetPasswordValidation = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/logout', verifyToken, logoutUser);
router.get('/me', verifyToken, getCurrentUser);

// 🔐 Forgot Password Routes
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.put('/reset-password/:token', resetPasswordValidation, resetPassword);

module.exports = router;