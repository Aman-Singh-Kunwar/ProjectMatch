const express = require('express');
const { getFacultyList, updateProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/faculty', authenticateToken, getFacultyList);
router.put('/me/profile', authenticateToken, updateProfile);

module.exports = router;
