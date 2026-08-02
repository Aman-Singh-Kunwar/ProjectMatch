const Project = require('../models/Project');
const Program = require('../models/Program');
const User = require('../models/User');
const { getStudentProjectLevel, cosineSimilarity } = require('../services/matchingService');

// POST /api/projects (Faculty Pool Idea)
const createPoolProject = async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ error: 'Only faculty members can post ideas to the pool.' });
    }

    const { title, description, domainTags, teamSizeMax, capacity, targetLevel } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    if (!targetLevel || !['minor', 'major'].includes(targetLevel)) {
      return res.status(400).json({ error: 'Target level must be specified as "minor" or "major".' });
    }

    const newProject = await Project.create({
      title,
      description,
      domainTags: domainTags || [],
      teamSizeMax: teamSizeMax || 4,
      capacity: capacity || 1,
      targetLevel,
      source: 'faculty_pool',
      createdBy: req.user._id,
      mentorStatus: 'not_applicable',
    });

    return res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating pool project:', error);
    return res.status(500).json({ error: error.message || 'Server error creating project.' });
  }
};

// POST /api/projects/propose (Student Proposed Idea)
const proposeStudentProject = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can propose custom research topics.' });
    }

    const { title, description, domainTags, requestedMentor } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    // Resolve student program document to infer targetLevel
    const userDoc = await User.findById(req.user._id).populate('program');
    if (!userDoc || !userDoc.program) {
      return res.status(400).json({ error: 'Student program details could not be resolved.' });
    }

    const targetLevel = getStudentProjectLevel(userDoc, userDoc.program);
    if (!targetLevel) {
      return res.status(400).json({
        error: 'You are not currently in an eligible project year for your academic program.',
      });
    }

    const newProject = await Project.create({
      title,
      description,
      domainTags: domainTags || [],
      targetLevel, // Inferred server-side
      source: 'student_proposed',
      createdBy: req.user._id,
      requestedMentor: requestedMentor || null,
      mentorStatus: requestedMentor ? 'pending_mentor_review' : 'not_applicable',
    });

    return res.status(201).json(newProject);
  } catch (error) {
    console.error('Error proposing project:', error);
    return res.status(500).json({ error: error.message || 'Server error proposing project.' });
  }
};

// GET /api/projects (List projects with optional filters)
const getProjects = async (req, res) => {
  try {
    const { source, status, targetLevel } = req.query;
    const filter = {};

    if (source) filter.source = source;
    if (status) filter.mentorStatus = status;
    if (targetLevel) filter.targetLevel = targetLevel;

    const projects = await Project.find(filter)
      .populate('createdBy', 'name email role')
      .populate('requestedMentor', 'name email')
      .sort({ createdAt: -1 });

    return res.json(projects);
  } catch (error) {
    return res.status(500).json({ error: 'Error fetching projects.' });
  }
};

// GET /api/projects/recommended (Student-only AI recommendations)
const getRecommendedProjects = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can request project recommendations.' });
    }

    const userDoc = await User.findById(req.user._id).populate('program');
    if (!userDoc || !userDoc.program) {
      return res.status(400).json({ error: 'Student program information not found.' });
    }

    // 1. Resolve student eligible level
    const eligibleLevel = getStudentProjectLevel(userDoc, userDoc.program);

    // 2. If student is not in a project year, return empty array with reason
    if (!eligibleLevel) {
      return res.json({
        recommendations: [],
        reason: 'not_in_project_year',
        eligibleLevel: null,
        userProgram: userDoc.program.name,
        currentYear: userDoc.currentYear,
      });
    }

    // 3. Filter candidate pool projects matching eligibleLevel BEFORE ranking
    const candidateProjects = await Project.find({
      source: 'faculty_pool',
      targetLevel: eligibleLevel,
    }).populate('createdBy', 'name email');

    // 4. Rank by cosine similarity if profileVector exists
    if (!userDoc.profileVector || userDoc.profileVector.length === 0) {
      // Unranked default list if vector not generated yet
      return res.json({
        recommendations: candidateProjects.map((p) => ({
          project: p,
          similarityScore: 0.5,
        })),
        eligibleLevel,
        reason: null,
      });
    }

    const ranked = candidateProjects.map((project) => {
      const score = project.descriptionVector
        ? cosineSimilarity(userDoc.profileVector, project.descriptionVector)
        : 0.5;
      return { project, similarityScore: Math.round(score * 100) / 100 };
    });

    ranked.sort((a, b) => b.similarityScore - a.similarityScore);

    return res.json({
      recommendations: ranked,
      eligibleLevel,
      reason: null,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return res.status(500).json({ error: 'Error generating recommendations.' });
  }
};

module.exports = {
  createPoolProject,
  proposeStudentProject,
  getProjects,
  getRecommendedProjects,
};
