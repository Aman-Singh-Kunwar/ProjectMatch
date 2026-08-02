const Team = require('../models/Team');
const Project = require('../models/Project');
const User = require('../models/User');

// GET /api/teams/mine — student's current active team
const getMyTeam = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students have active project teams.' });
    }

    const team = await Team.findOne({ members: req.user._id })
      .populate({
        path: 'project',
        populate: [
          { path: 'createdBy', select: 'name email role' },
          { path: 'requestedMentor', select: 'name email' },
        ],
      })
      .populate('members', 'name email role currentYear program')
      .populate('mentor', 'name email');

    if (!team) {
      return res.json(null);
    }

    return res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return res.status(500).json({ error: 'Server error fetching user team.' });
  }
};

// POST /api/teams — create or update forming team around a project
const createOrUpdateTeam = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can create project teams.' });
    }

    const { projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project idea not found.' });
    }

    let team = await Team.findOne({ members: req.user._id });

    if (!team) {
      // Create new team with student as creator & first member
      team = await Team.create({
        project: project._id,
        members: [req.user._id],
        mentor: project.source === 'faculty_pool' ? project.createdBy : (project.mentorStatus === 'mentor_accepted' ? project.requestedMentor : null),
        status: 'forming',
      });
    } else {
      if (team.status !== 'forming' && team.status !== 'rejected') {
        return res.status(400).json({ error: 'Cannot change project once team is submitted for approval.' });
      }

      team.project = project._id;
      team.mentor = project.source === 'faculty_pool' ? project.createdBy : (project.mentorStatus === 'mentor_accepted' ? project.requestedMentor : null);
      if (team.status === 'rejected') {
        team.status = 'forming'; // Reset status to forming on edit
      }
      await team.save();
    }

    const populatedTeam = await Team.findById(team._id)
      .populate({
        path: 'project',
        populate: [
          { path: 'createdBy', select: 'name email role' },
          { path: 'requestedMentor', select: 'name email' },
        ],
      })
      .populate('members', 'name email role currentYear program')
      .populate('mentor', 'name email');

    return res.status(201).json(populatedTeam);
  } catch (error) {
    console.error('Error creating/updating team:', error);
    return res.status(500).json({ error: error.message || 'Server error locking project idea.' });
  }
};

// POST /api/teams/:id/members — add teammate by email
const addTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Teammate email address is required.' });
    }

    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    if (!team.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: 'Only team members can add teammates.' });
    }

    if (team.status !== 'forming' && team.status !== 'rejected') {
      return res.status(400).json({ error: 'Cannot add members after team is submitted for approval.' });
    }

    const teammate = await User.findOne({ email: email.toLowerCase().trim() });
    if (!teammate) {
      return res.status(404).json({ error: `No registered user found with email '${email}'.` });
    }

    if (teammate.role !== 'student') {
      return res.status(400).json({ error: 'Only students can be added as team members.' });
    }

    // Check if teammate is already in another team
    const existingTeam = await Team.findOne({ members: teammate._id });
    if (existingTeam && existingTeam._id.toString() !== team._id.toString()) {
      return res.status(400).json({ error: `'${teammate.name}' is already a member of another project team.` });
    }

    if (team.members.some((m) => m.toString() === teammate._id.toString())) {
      return res.status(400).json({ error: `'${teammate.name}' is already in this team.` });
    }

    team.members.push(teammate._id);
    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate({
        path: 'project',
        populate: [
          { path: 'createdBy', select: 'name email role' },
          { path: 'requestedMentor', select: 'name email' },
        ],
      })
      .populate('members', 'name email role currentYear program')
      .populate('mentor', 'name email');

    return res.json(populatedTeam);
  } catch (error) {
    console.error('Error adding member:', error);
    return res.status(500).json({ error: error.message || 'Server error adding member.' });
  }
};

// POST /api/teams/:id/submit — submit team for admin approval
const submitTeam = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id).populate('project');
    if (!team) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    if (!team.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ error: 'Only team members can submit the team.' });
    }

    if (!team.project) {
      return res.status(400).json({ error: 'You must select a project idea before submitting.' });
    }

    const project = team.project;
    if (project.source === 'student_proposed' && project.mentorStatus !== 'mentor_accepted') {
      return res.status(400).json({
        error: 'Your requested faculty mentor must accept the proposal before team submission.',
      });
    }

    team.status = 'pending_admin_approval';
    await team.save();

    const populatedTeam = await Team.findById(team._id)
      .populate({
        path: 'project',
        populate: [
          { path: 'createdBy', select: 'name email role' },
          { path: 'requestedMentor', select: 'name email' },
        ],
      })
      .populate('members', 'name email role currentYear program')
      .populate('mentor', 'name email');

    return res.json(populatedTeam);
  } catch (error) {
    console.error('Error submitting team:', error);
    return res.status(500).json({ error: error.message || 'Server error submitting team.' });
  }
};

module.exports = {
  getMyTeam,
  createOrUpdateTeam,
  addTeamMember,
  submitTeam,
};
