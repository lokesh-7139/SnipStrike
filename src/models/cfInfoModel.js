const mongoose = require('mongoose');

const cfInfoSchema = new mongoose.Schema(
  {
    handle: {
      type: String,
      required: [true, 'Codeforces account must have a handle'],
      unique: true,
      index: true,
      trim: true,
    },
    rating: {
      type: Number,
    },
    maxRating: {
      type: Number,
    },
    rank: {
      type: String,
    },
    maxRank: {
      type: String,
    },
  },
  { timestamps: true }
);

const CfInfo = mongoose.model('CfInfo', cfInfoSchema);

module.exports = CfInfo;
