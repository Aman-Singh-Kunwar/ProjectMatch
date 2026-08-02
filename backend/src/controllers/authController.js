const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Program = require('../models/Program');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'projectmatch_super_secret_jwt_key_2026';
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, program: user.program },
    secret,
    { expiresIn: '7d' }
  );
};

// Format user response object
const formatUserResponse = async (userDoc) => {
  let populatedUser = userDoc;
  if (userDoc.program && (!userDoc.populated || !userDoc.populated('program'))) {
    populatedUser = await User.findById(userDoc._id).populate('program');
  }

  return {
    id: populatedUser._id,
    _id: populatedUser._id,
    name: populatedUser.name,
    email: populatedUser.email,
    admissionNo: populatedUser.admissionNo || null,
    role: populatedUser.role,
    program: populatedUser.program || null,
    currentYear: populatedUser.currentYear || null,
    skills: populatedUser.skills || [],
    interests: populatedUser.interests || [],
  };
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, admissionNo, password, role, program, currentYear } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Please provide name, email, password, and role.' });
    }

    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified.' });
    }

    // For students: Admission No is required
    let formattedAdmissionNo = null;
    if (role === 'student') {
      if (!admissionNo || !admissionNo.trim()) {
        return res.status(400).json({ error: 'Students must provide an Admission Number.' });
      }
      formattedAdmissionNo = admissionNo.trim().toUpperCase();

      const existingStudent = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { admissionNo: formattedAdmissionNo }],
      });

      if (existingStudent) {
        if (existingStudent.email === email.toLowerCase()) {
          return res.status(400).json({ error: 'User with this email already exists.' });
        }
        return res.status(400).json({ error: 'Student with this Admission Number already exists.' });
      }
    } else {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists.' });
      }
    }

    let validProgramId = null;
    let validCurrentYear = null;

    if (role === 'student' && program && currentYear) {
      const programDoc = await Program.findById(program);
      if (programDoc) {
        validProgramId = programDoc._id;
        validCurrentYear = parseInt(currentYear, 10);
      }
    }

    const passwordHash = await User.hashPassword(password);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      admissionNo: formattedAdmissionNo,
      passwordHash,
      role,
      program: validProgramId,
      currentYear: validCurrentYear,
    });

    const token = generateToken(newUser);
    const formattedUser = await formatUserResponse(newUser);

    return res.status(201).json({
      token,
      user: formattedUser,
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
      return res.status(400).json({ error: 'Please provide email or admission number and password.' });
    }

    const rawIdentifier = email.trim();
    const queryEmail = rawIdentifier.toLowerCase();
    const queryAdmissionNo = rawIdentifier.toUpperCase();

    // Support login by Email OR Admission Number
    const user = await User.findOne({
      $or: [{ email: queryEmail }, { admissionNo: queryAdmissionNo }],
    }).populate('program');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken(user);
    const formattedUser = await formatUserResponse(user);

    return res.json({
      token,
      user: formattedUser,
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: error.message || 'Server error during login.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('program');
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    const formattedUser = await formatUserResponse(user);
    return res.json({ user: formattedUser });
  } catch (error) {
    return res.status(500).json({ error: 'Server error fetching user profile.' });
  }
};

module.exports = { register, login, getMe };
