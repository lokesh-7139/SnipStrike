const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  name: String,
  index: String,
  contestId: Number,
  rating: Number,
  tags: [String],
  link: String,
  isSolved: {
    type: Boolean,
  },
});

const practiceSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filter: {
      tags: [String],
      minRating: {
        type: Number,
        required: true,
      },
      maxRating: {
        type: Number,
        required: true,
      },
      count: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
    },
    problems: {
      type: [problemSchema],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'ended'],
      default: 'draft',
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    solvedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const PracticeSession = mongoose.model(
  'PracticeSession',
  practiceSessionSchema
);

module.exports = PracticeSession;
