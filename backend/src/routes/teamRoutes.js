const express = require('express');
const {
  getMyTeam,
  createOrUpdateTeam,
  addTeamMember,
  submitTeam,
} = require('../controllers/teamController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/mine', authenticateToken, getMyTeam);
router.post('/', authenticateToken, createOrUpdateTeam);
router.post('/:id/members', authenticateToken, addTeamMember);
router.post('/:id/submit', authenticateToken, submitTeam);

module.exports = router;
