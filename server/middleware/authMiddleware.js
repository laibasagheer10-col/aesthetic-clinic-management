const jwt = require("jsonwebtoken");
const User = require('../models/auth/User');
require("dotenv").config();

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch full user details with role
    const user = await User.findById(decoded.id)
      .populate('roleId')
      .select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user is active
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Contact SuperAdmin."
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(403).json({
        success: false,
        message: "Account is temporarily locked. Try again later."
      });
    }

    // Attach enhanced user info to request
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.roleId?.roleName || decoded.role,
      roleId: user.roleId?._id,
      permissions: user.roleId?.permissions || [],
      department: user.department,
      status: user.status
    };
    
    next();

  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};