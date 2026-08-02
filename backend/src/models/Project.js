const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    domainTags: {
      type: [String],
      default: [],
    },
    teamSizeMax: {
      type: Number,
      default: 4,
    },
    capacity: {
      type: Number,
      default: 1,
    },
    targetLevel: {
      type: String,
      enum: ['minor', 'major'],
      required: [true, 'Target level (minor or major) is required'],
    },
    source: {
      type: String,
      enum: ['faculty_pool', 'student_proposed'],
      required: [true, 'Source (faculty_pool or student_proposed) is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    requestedMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    mentorStatus: {
      type: String,
      enum: ['not_applicable', 'pending_mentor_review', 'mentor_accepted', 'mentor_rejected'],
      default: 'not_applicable',
    },
    descriptionVector: {
      type: [Number],
      default: null,
      alias: 'descriptionEmbedding',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
