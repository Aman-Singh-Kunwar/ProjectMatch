const Program = require('../models/Program');

// GET /api/programs
const getPrograms = async (req, res) => {
  try {
    const programs = await Program.find({}).sort({ code: 1 });
    return res.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    return res.status(500).json({ error: 'Failed to fetch academic programs' });
  }
};

module.exports = { getPrograms };
