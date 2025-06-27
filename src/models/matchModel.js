const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    player1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    player2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: [
        'waiting',
        'invited',
        'accepted',
        'rejected',
        'ongoing',
        'completed',
        'cancelled',
      ],
      default: 'waiting',
    },
    isFriendMatch: {
      type: Boolean,
      default: false,
    },
    result: {
      winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      draw: {
        type: Boolean,
        default: false,
      },
    },
  },
  { timestamps: true }
);

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;
