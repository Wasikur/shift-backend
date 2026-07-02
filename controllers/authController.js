const User = require('../models/User');
const { generateToken } = require('../middleware/authMiddleware');

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, ssoOnly: false });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ssoOnly: user.ssoOnly,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        ssoOnly: user.ssoOnly,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      ssoOnly: user.ssoOnly === undefined ? false : user.ssoOnly
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const googleLoginUser = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Verify token with Google's tokeninfo API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    const data = await response.json();

    if (!response.ok || data.error) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    const { email, name, picture } = data;

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // If ssoOnly is undefined (legacy Google user), set it to true and save it
      if (user.ssoOnly === undefined) {
        user.ssoOnly = true;
        await user.save();
      }
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        ssoOnly: user.ssoOnly,
        token: generateToken(user._id)
      });
    }

    // Generate a secure random password since this is SSO — user cannot use this to log in
    const securePassword = require('crypto').randomBytes(16).toString('hex');

    // Create new SSO user — ssoOnly: true means no real password has been set yet
    user = await User.create({
      name,
      email,
      password: securePassword,
      ssoOnly: true,
      avatar: picture || 'https://i.pravatar.cc/150',
      role: 'user'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        ssoOnly: user.ssoOnly,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Failed to create user account' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/auth/profile — update name and phone
const updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check phone uniqueness if being changed
    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({ phone, _id: { $ne: user._id } });
      if (phoneExists) return res.status(400).json({ message: 'Phone number already in use' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone || undefined;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      ssoOnly: user.ssoOnly,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/auth/password — set or change password
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    // Fetch user WITH password field (it's excluded by protect middleware)
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.ssoOnly) {
      // SSO user setting a password for the first time — no current password required
      user.password = newPassword;
      user.ssoOnly = false;
    } else {
      // User already has a real password — must verify current password first
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({
      message: 'Password updated successfully',
      ssoOnly: user.ssoOnly
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  googleLoginUser,
  updateUserProfile,
  updatePassword
};
