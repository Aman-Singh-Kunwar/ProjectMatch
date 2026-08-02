const express = require('express');
const { getPrograms } = require('../controllers/programController');

const router = express.Router();

// GET /api/programs (Public dropdown route)
router.get('/', getPrograms);

module.exports = router;
