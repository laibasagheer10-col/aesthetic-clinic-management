const User = require('../models/auth/User');
const Role = require('../models/auth/Role');
const bcrypt = require('bcryptjs');

// Get all users with filters
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    let query = {};

    // Apply filters
    if (role) query.roleId = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('roleId')
      .populate('createdBy', 'name email')
      .sort('-createdAt')
      .select('-password -resetPasswordToken -resetPasswordExpire');

    // Get all roles for filtering
    const roles = await Role.find().select('roleName');

    res.json({
      users,
      roles,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get single user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('roleId')
      .populate('createdBy', 'name email')
      .select('-password -resetPasswordToken -resetPasswordExpire');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, roleId, department, status } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      roleId,
      department: department || null,
      status: status || 'active',
      createdBy: req.user.id,
      loginAttempts: 0
    });

    const populatedUser = await User.findById(user._id)
      .populate('roleId')
      .populate('createdBy', 'name email')
      .select('-password');

    res.status(201).json(populatedUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { name, phone, roleId, department, status } = req.body;
    const userId = req.params.id;

    // Prevent SuperAdmin from being modified by non-SuperAdmin
    const targetUser = await User.findById(userId).populate('roleId');
    const currentUser = await User.findById(req.user.id).populate('roleId');

    if (targetUser?.roleId?.roleName === 'SuperAdmin' && 
        currentUser?.roleId?.roleName !== 'SuperAdmin') {
      return res.status(403).json({ error: 'Cannot modify SuperAdmin user' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, roleId, department, status },
      { new: true, runValidators: true }
    )
      .populate('roleId')
      .populate('createdBy', 'name email')
      .select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user status (activate/deactivate)
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Prevent SuperAdmin deactivation
    const targetUser = await User.findById(id).populate('roleId');
    const currentUser = await User.findById(req.user.id).populate('roleId');

    if (targetUser?.roleId?.roleName === 'SuperAdmin' && 
        currentUser?.roleId?.roleName !== 'SuperAdmin') {
      return res.status(403).json({ error: 'Cannot modify SuperAdmin status' });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate('roleId')
      .select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent SuperAdmin deletion
    const targetUser = await User.findById(id).populate('roleId');
    const currentUser = await User.findById(req.user.id).populate('roleId');

    if (targetUser?.roleId?.roleName === 'SuperAdmin') {
      return res.status(403).json({ error: 'Cannot delete SuperAdmin user' });
    }

    // Prevent self-deletion
    if (id === req.user.id) {
      return res.status(403).json({ error: 'Cannot delete your own account' });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user profile (for current user)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, profileImage },
      { new: true, runValidators: true }
    )
      .populate('roleId')
      .select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: error.message });
  }
};