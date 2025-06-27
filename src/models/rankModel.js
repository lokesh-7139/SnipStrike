const mongoose = require('mongoose');

const rankSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      unique: true,
      required: [true, 'A rank must have a name'],
      maxlength: [30, 'Name must have less than or equal to 30 characters'],
    },
    minPoints: {
      type: Number,
      required: [true, 'Minpoints are required to create a rank'],
    },
    maxPoints: {
      type: Number,
      required: [true, 'Maxpoints are required to create a rank'],
    },
    color: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

rankSchema.index({ minPoints: 1, maxPoints: 1 });

const Rank = mongoose.model('Rank', rankSchema);

module.exports = Rank;
