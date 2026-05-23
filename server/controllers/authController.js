const User = require('../models/auth/User');
const Role = require('../models/auth/Role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require("express-validator");

// Helper response functions
const successResponse = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};

const errorResponse = (res, message, statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

// REGISTER USER
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, "User already exists", 400);
    }

    let patientRole = await Role.findOne({ roleName: 'Patient' });
    
    if (!patientRole) {
      patientRole = await Role.create({
        roleName: 'Patient',
        permissions: ['view_dashboard', 'view_appointments']
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      roleId: patientRole._id,
      status: 'active'
    });

    const token = jwt.sign(
      { 
        id: user._id, 
        role: 'Patient',
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await user.populate('roleId');
    user.password = undefined;

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: 'Patient',
        status: user.status
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

// LOGIN USER
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, "Validation failed", 400, errors.array());
    }

    const user = await User.findOne({ email }).populate("roleId");
    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    if (user.status !== 'active') {
      return errorResponse(res, "Account is deactivated", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Set token expiry based on remember me
    const tokenExpiry = rememberMe ? "30d" : "7d";
    
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.roleId?.roleName || 'User',
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Set HTTP-only cookie for better security
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.roleId?.roleName || 'User',
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

// LOGOUT USER - FIXED
exports.logoutUser = async (req, res, next) => {
  try {
    // Clear the cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error('Logout error:', error);
    next(error);
  }
};

// GET CURRENT USER
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('roleId')
      .select('-password');
    
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.roleId?.roleName || 'User',
        status: user.status
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    next(error);
  }
};