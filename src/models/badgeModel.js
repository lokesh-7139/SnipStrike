const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true,
      required: [true, 'A badge must have a code'],
      uppercase: true,
    },
    name: {
      type: String,
      unique: true,
      required: [true, 'A badge must have a name'],
      maxlength: [30, 'Name must have less than or equal to 30 characters'],
    },
    description: {
      type: String,
      maxlength: [
        100,
        'Description must have less than or equal to 100 characters',
      ],
    },
    type: {
      type: String,
      enum: ['performance', 'special', 'seasonal'],
      default: 'performance',
    },
    level: {
      type: String,
      enum: ['Gold', 'Silver', 'Bronze'],
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    totalMatchesRequired: {
      type: Number,
      default: null,
    },
    totalWinsRequired: {
      type: Number,
      default: null,
    },
    winStreakRequired: {
      type: Number,
      default: null,
    },
    yearsActiveRequired: {
      type: Number,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Badge = mongoose.model('Badge', badgeSchema);

module.exports = Badge;
