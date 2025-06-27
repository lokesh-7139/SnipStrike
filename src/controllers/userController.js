const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');
const filterObj = require('../utils/filterObject');

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// change this later bcz of verification changes.
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. please use /updateMyPassword instead',
        400
      )
    );
  }
  const fieldsAllowed = ['name', 'photo'];
  const filteredbody = filterObj(req.body, ...fieldsAllowed);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredbody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deactivateMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.limitUserFields = (req, res, next) => {
  const fieldsAllowed = [
    'name',
    'email',
    'photo',
    'codeforcesHandle',
    'matchesPlayed',
    'matchesWon',
    'currentStreak',
    'maxStreak',
    'points',
    'rank',
    'badges',
  ];
  let fields = [];
  if (req.query.fields) {
    let fieldsAsked = req.query.fields.split(',');
    fields = fieldsAsked.filter((field) => fieldsAllowed.includes(field));
    if (fields.length === 0) {
      return next(new AppError('No valid fields requested', 400));
    }
  } else {
    fields = [...fieldsAllowed];
  }
  req.query.fields = fields.join(',');
  next();
};

exports.getUsers = catchAsync(async (req, res, next) => {
  const includeInactiveUsers = req.user.role === 'admin' ? true : false;
  const features = new APIFeatures(
    User.find().setOptions({ includeInactiveUsers }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      data: users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const includeInactiveUsers = req.user.role === 'admin' ? true : false;
  const features = new APIFeatures(
    User.findById(req.params.id).setOptions({ includeInactiveUsers }),
    req.query
  ).limitFields();
  const user = await features.query;

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: user,
    },
  });
});

exports.promoteUser = catchAsync(async (req, res, next) => {
  const { role } = filterObj(req.body, 'role');
  if (!role) {
    return next(new AppError('Please provide a role to update', 400));
  }

  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    return next(new AppError('No user found', 404));
  }
  if (targetUser.role === role) {
    return next(new AppError('User already has this role', 400));
  }
  targetUser.role = role;
  await targetUser.save();

  res.status(200).json({
    status: 'success',
    data: {
      data: targetUser,
    },
  });
});

exports.toggleUserStatus = catchAsync(async (req, res, next) => {
  const targetUser = User.findById(req.params.id);
  if (!targetUser) {
    return next(new AppError('No user found', 404));
  }

  targetUser.isActive = !targetUser.isActive;
  await targetUser.save({ validateBeforeSave: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
