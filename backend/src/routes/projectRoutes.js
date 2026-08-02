const express = require('express');
const {
  createPoolProject,
  proposeStudentProject,
  getProjects,
  getRecommendedProjects,
} = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', getProjects);
router.get('/recommended', authenticateToken, getRecommendedProjects);
router.post('/', authenticateToken, createPoolProject);
router.post('/propose', authenticateToken, proposeStudentProject);

module.exports = router;
