const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getRedisClient } = require('../config/redis');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email ? 'Email already in use' : 'Username already taken',
      });
    }

    const user = await User.create({ username, email, password, displayName: displayName || username });
    const token = generateToken(user._id);

    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    user.lastSeen = new Date();
    await user.save();

    const token = generateToken(user._id);

    // Cache user session in Redis
    const redis = getRedisClient();
    await redis.setex(`session:${user._id}`, 7 * 24 * 60 * 60, JSON.stringify({ userId: user._id, token }));

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const redis = getRedisClient();
    await redis.del(`session:${req.user._id}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
};

const getMe = async (req, res) => {
  res.json(req.user);
};

const refreshToken = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Token refresh failed' });
  }
};

module.exports = { register, login, logout, getMe, refreshToken };
