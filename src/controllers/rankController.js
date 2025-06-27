const Rank = require('../models/rankModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const getMissingFields = require('../utils/getMissingFields');

exports.getRanks = catchAsync(async (req, res, next) => {
  if (!req.query.sort) {
    req.query.sort = 'minPoints';
  }

  const features = new APIFeatures(Rank.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const ranks = await features.query;

  res.status(200).json({
    status: 'success',
    results: ranks.length,
    data: {
      data: ranks,
    },
  });
});

exports.getRank = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    Rank.findById(req.params.id),
    req.query
  ).limitFields();
  const rank = await features.query;

  if (!rank) {
    return next(new AppError('No Rank found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: rank,
    },
  });
});

exports.createRank = catchAsync(async (req, res, next) => {
  const requiredFields = ['code', 'name', 'minPoints', 'maxPoints'];
  const missingFields = getMissingFields(req.body, ...requiredFields);
  if (missingFields.length > 0) {
    return next(
      new AppError(`Missing fields: ${missingFields.join(', ')}`, 400)
    );
  }

  if (req.body.minPoints > req.body.maxPoints) {
    return next(
      new AppError('minPoints cannot be greater than maxPoints', 400)
    );
  }

  const overlap = await Rank.findOne({
    minPoints: { $lte: req.body.maxPoints },
    maxPoints: { $gte: req.body.minPoints },
  });
  if (overlap) {
    return next(new AppError('Overlapping rank range exists', 400));
  }

  const newRank = await Rank.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      data: newRank,
    },
  });
});

exports.updateRank = catchAsync(async (req, res, next) => {
  const currentRank = await Rank.findById(req.params.id);
  if (!currentRank) {
    return next(new AppError('No rank found', 404));
  }

  const newMin = req.body.minPoints ?? currentRank.minPoints;
  const newMax = req.body.maxPoints ?? currentRank.maxPoints;

  if (newMin > newMax) {
    return next(
      new AppError('minPoints cannot be greater than maxPoints', 400)
    );
  }

  const overlap = await Rank.findOne({
    _id: { $ne: req.params.id },
    minPoints: { $lte: newMax },
    maxPoints: { $gte: newMin },
  });

  if (overlap) {
    return next(new AppError('Overlapping rank range exists', 400));
  }

  const updatedRank = await Rank.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      data: updatedRank,
    },
  });
});

exports.deleteRank = catchAsync(async (req, res, next) => {
  const deletedRank = await Rank.findByIdAndDelete(req.params.id);
  if (!deletedRank) {
    return next(new AppError('No rank found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getRankByPoints = catchAsync(async (req, res, next) => {
  const points = parseInt(req.params.points);
  if (isNaN(points)) {
    return next(new AppError('Invalid points value', 400));
  }

  const rank = await Rank.findOne({
    minPoints: { $lte: points },
    maxPoints: { $gte: points },
  });

  if (!rank) {
    return next(new AppError('No matching rank found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: rank,
    },
  });
});
