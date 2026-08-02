const User = require('../models/User');

// GET /api/users/faculty — List all faculty members for mentor selection
const getFacultyList = async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' })
      .select('name email skills interests')
      .sort({ name: 1 });
    return res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty list:', error);
    return res.status(500).json({ error: 'Server error fetching faculty list.' });
  }
};

// PUT /api/users/me/profile — Update student skills & interests profile
const updateProfile = async (req, res) => {
  try {
    const { skills, interests } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    if (skills && Array.isArray(skills)) user.skills = skills;
    if (interests && Array.isArray(interests)) user.interests = interests;

    await user.save();
    return res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Server error updating profile.' });
  }
};

module.exports = { getFacultyList, updateProfile };
