const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Program code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Program name is required'],
    trim: true,
  },
  minorYear: {
    type: Number,
    required: [true, 'Minor project year is required'],
  },
  majorYear: {
    type: Number,
    required: [true, 'Major project year is required'],
  },
  durationYears: {
    type: Number,
    required: [true, 'Duration in years is required'],
  },
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);
