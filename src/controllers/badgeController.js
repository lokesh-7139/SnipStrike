const Badge = require('../models/badgeModel');
const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const getMissingFields = require('../utils/getMissingFields');

exports.getBadges = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Badge.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const badges = await features.query;

  res.status(200).json({
    status: 'success',
    results: badges.length,
    data: {
      data: badges,
    },
  });
});

exports.getBadge = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Badge.findById(req.params.id),
    req.query
  ).limitFields();
  const badge = await features.query;

  if (!badge) {
    return next(new AppError('No Badge found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: badge,
    },
  });
});

exports.createBadge = catchAsync(async (req, res, next) => {
  const requiredFields = ['code', 'name'];
  const missingFields = getMissingFields(req.body, ...requiredFields);
  if (missingFields.length > 0) {
    return next(
      new AppError(`Missing fields: ${missingFields.join(', ')}`, 400)
    );
  }

  const newBadge = await Badge.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      data: newBadge,
    },
  });
});

exports.toggleBadgeStatus = catchAsync(async (req, res, next) => {
  const badge = await Badge.findById(req.params.id);

  if (!badge) {
    return next(new AppError('No badge found with that ID', 404));
  }

  badge.isActive = !badge.isActive;
  await badge.save();

  res.status(200).json({
    status: 'success',
    data: {
      badge,
    },
  });
});

exports.deleteBadge = catchAsync(async (req, res, next) => {
  const usersWithBadge = await User.find({ 'badges.badge': req.params.id });

  if (usersWithBadge.length > 0) {
    return next(
      new AppError(
        'Cannot delete badge that has already been awarded to users. Consider disabling it instead.',
        400
      )
    );
  }

  await Badge.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
