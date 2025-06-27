const Friendship = require('../models/friendshipModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.sendRequest = catchAsync(async (req, res, next) => {
  if (req.user.id === req.params.id) {
    return next(new AppError('You cannot send a request to yourself.', 400));
  }

  const existing = await Friendship.findOne({
    $or: [
      { requester: req.user.id, recipient: req.params.id },
      { requester: req.params.id, recipient: req.user.id },
    ],
  });

  if (existing) {
    if (existing.status === 'blocked') {
      return next(
        new AppError(
          'Friend request blocked: one of the users has blocked the other.',
          403
        )
      );
    }
    if (existing.status === 'accepted') {
      return next(new AppError('You are already friends with this user.', 400));
    }
    return next(new AppError('Friend request already sent or pending.', 400));
  }

  const newFriendship = await Friendship.create({
    requester: req.user.id,
    recipient: req.params.id,
    status: 'pending',
  });

  res.status(201).json({
    status: 'success',
    data: {
      data: newFriendship,
    },
  });
});

exports.cancelRequest = catchAsync(async (req, res, next) => {
  const friendship = await Friendship.findOne({
    requester: req.user.id,
    recipient: req.params.id,
    status: 'pending',
  });

  if (!friendship) {
    return next(new AppError('No pending friend request to cancel', 404));
  }

  await friendship.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.acceptRequest = catchAsync(async (req, res, next) => {
  const friendship = await Friendship.findOneAndUpdate(
    {
      requester: req.params.id,
      recipient: req.user.id,
      status: 'pending',
    },
    {
      status: 'accepted',
      acceptedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!friendship) {
    return next(new AppError('No pending request found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: friendship,
    },
  });
});

exports.rejectRequest = catchAsync(async (req, res, next) => {
  const friendship = await Friendship.findOneAndUpdate(
    {
      requester: req.params.id,
      recipient: req.user.id,
      status: 'pending',
    },
    {
      status: 'rejected',
      rejectedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!friendship) {
    return next(new AppError('No pending request found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: friendship,
    },
  });
});

exports.removeFriend = catchAsync(async (req, res, next) => {
  const friendship = await Friendship.findOne({
    status: 'accepted',
    $or: [
      { requester: req.user.id, recipient: req.params.id },
      { requester: req.params.id, recipient: req.user.id },
    ],
  });

  if (!friendship) {
    return next(new AppError('No active friendship to remove', 404));
  }

  await friendship.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.blockUser = catchAsync(async (req, res, next) => {
  await Friendship.findOneAndDelete({
    requester: req.params.id,
    recipient: req.user.id,
    status: {
      $ne: 'blocked',
    },
  });

  let friendship = await Friendship.findOne({
    requester: req.user.id,
    recipient: req.params.id,
  });

  if (!friendship) {
    friendship = await Friendship.create({
      requester: req.user.id,
      recipient: req.params.id,
    });
  }

  if (friendship.status === 'blocked') {
    return next(new AppError('You already blocked this user', 403));
  }

  friendship.status = 'blocked';
  friendship.blockedBy = req.user.id;
  friendship.blockedAt = Date.now();

  await friendship.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: friendship,
    },
  });
});

exports.unblockUser = catchAsync(async (req, res, next) => {
  const friendship = await Friendship.findOne({
    requester: req.user.id,
    recipient: req.params.id,
    status: 'blocked',
    blockedBy: req.user.id,
  });

  if (!friendship) {
    return next(new AppError('No blocked friendship found', 404));
  }

  await friendship.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getFriends = catchAsync(async (req, res, next) => {
  const friendships = await Friendship.find({
    status: 'accepted',
    $or: [{ requester: req.user.id }, { recipient: req.user.id }],
  }).setOptions({
    populateRequester: true,
    populateRecipient: true,
  });

  const friends = friendships.map((friendship) => {
    const friend =
      friendship.requester._id.toString() === req.user.id
        ? friendship.recipient
        : friendship.requester;
    return friend;
  });

  res.status(200).json({
    status: 'success',
    results: friends.length,
    data: {
      data: friends,
    },
  });
});

exports.setStatus = (status) => {
  return (req, res, next) => {
    req.requestStatus = status;
    next();
  };
};

exports.getReceivedRequests = catchAsync(async (req, res, next) => {
  const requests = await Friendship.find({
    recipient: req.user.id,
    status: req.requestStatus,
  }).setOptions({ populateRequester: true });

  res.status(200).json({
    status: 'success',
    results: requests.length,
    data: {
      requests,
    },
  });
});

exports.getSentRequests = catchAsync(async (req, res, next) => {
  const requests = await Friendship.find({
    requester: req.user.id,
    status: req.requestStatus,
  }).setOptions({ populateRecipient: true });

  res.status(200).json({
    status: 'success',
    results: requests.length,
    data: {
      requests,
    },
  });
});

exports.getBlockedUsers = catchAsync(async (req, res, next) => {
  const blocked = await Friendship.find({
    requester: req.user.id,
    status: 'blocked',
    blockedBy: req.user.id,
  }).setOptions({ populateRecipient: true });

  res.status(200).json({
    status: 'success',
    results: blocked.length,
    data: {
      blocked,
    },
  });
});

exports.getRequestSummary = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const [
    sentPending,
    sentRejected,
    receivedPending,
    receivedRejected,
    friends,
    blocked,
  ] = await Promise.all([
    Friendship.countDocuments({ requester: userId, status: 'pending' }),
    Friendship.countDocuments({ requester: userId, status: 'rejected' }),
    Friendship.countDocuments({ recipient: userId, status: 'pending' }),
    Friendship.countDocuments({ recipient: userId, status: 'rejected' }),
    Friendship.countDocuments({
      status: 'accepted',
      $or: [{ requester: userId }, { recipient: userId }],
    }),
    Friendship.countDocuments({
      requester: userId,
      status: 'blocked',
      blockedBy: userId,
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      sent: {
        pending: sentPending,
        rejected: sentRejected,
      },
      received: {
        pending: receivedPending,
        rejected: receivedRejected,
      },
      friends,
      blocked,
    },
  });
});
