const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'projectmatch_super_secret_jwt_key_2026';
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    secret,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Please provide name, email, password, and role.' });
    }

    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const passwordHash = await User.hashPassword(password);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        skills: newUser.skills,
        interests: newUser.interests,
      },
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: error.message || 'Server error during registration.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        interests: user.interests,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: error.message || 'Server error during login.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    return res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        skills: req.user.skills,
        interests: req.user.interests,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Server error fetching user profile.' });
  }
};

module.exports = { register, login, getMe };
