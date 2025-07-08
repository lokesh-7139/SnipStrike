const PracticeSession = require('../models/practiceSessionModel');
const cfServices = require('../services/codeforcesService');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const filterObj = require('../utils/filterObject');
const getMissingFields = require('../utils/getMissingFields');
const problemsManager = require('../utils/problemsManager');
const problemsCache = require('../utils/problemsCache');

exports.getMySessions = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(
    PracticeSession.find({ user: req.user.id }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const sessions = await features.query;

  res.status(200).json({
    status: 'success',
    data: {
      sessions,
    },
  });
});

exports.getPracticeSession = (req, res, next) => {
  const session = req.targetPracticeSession;

  res.status(200).json({
    status: 'success',
    data: {
      session,
    },
  });
};

exports.createPracticeSession = catchAsync(async (req, res, next) => {
  const requiredFields = ['tags', 'minRating', 'maxRating', 'count'];
  const filteredBody = filterObj(req.body, ...requiredFields);
  const missingFields = getMissingFields(filteredBody, ...requiredFields);
  if (missingFields.length > 0) {
    return next(
      new AppError(`Missing fields: ${missingFields.join(', ')}`, 400)
    );
  }

  const newSession = new PracticeSession();
  newSession.user = req.user.id;

  const result = await cfServices.getProblems(filteredBody.tags);

  if (result.status === 'failed') {
    return next(
      new AppError('Failed to create session, try after some time', 502)
    );
  }

  const filteredProblems = problemsManager.filterProblems(
    result.problems,
    filteredBody.minRating,
    filteredBody.maxRating
  );

  const selectedProblems = problemsManager.selectProblems(
    filteredProblems,
    filteredBody.count
  );

  if (selectedProblems.length === 0) {
    return next(new AppError('No problems found for this filter', 404));
  }

  let message = '';
  if (selectedProblems.length < filteredBody.count) {
    filteredBody.count = selectedProblems.length;
    message = 'Fewer problems available for this filter';
  }

  newSession.filter = filteredBody;
  newSession.problems = selectedProblems;

  await newSession.save();

  problemsCache.setProblems(newSession.id, filteredProblems);

  res.status(201).json({
    status: 'success',
    data: {
      newSession,
    },
    message,
  });
});

exports.refreshSessionProblems = catchAsync(async (req, res, next) => {
  const session = req.targetPracticeSession;
  const cached = problemsCache.getProblems(session.id);

  const selectedProblems = problemsManager.selectProblems(
    cached,
    session.filter.count
  );

  session.problems = selectedProblems;

  await session.save();

  res.status(201).json({
    status: 'success',
    data: {
      session,
    },
  });
});

exports.startPracticeSession = catchAsync(async (req, res, next) => {
  const session = req.targetPracticeSession;

  session.status = 'active';
  session.startedAt = Date.now();
  await session.save();

  problemsCache.deleteProblems(session.id);

  res.status(200).json({
    status: 'success',
    data: {
      session,
    },
  });
});

exports.endPracticeSession = catchAsync(async (req, res, next) => {
  const session = req.targetPracticeSession;

  session.status = 'ended';
  session.endedAt = Date.now();
  await session.save();

  res.status(200).json({
    status: 'success',
    data: {
      session,
    },
  });
});

exports.deletePracticeSession = catchAsync(async (req, res, next) => {
  const session = req.targetPracticeSession;
  await session.deleteOne();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.toggleProblemStatus = catchAsync(async (req, res, next) => {
  const session = req.targetPracticeSession;
  if (req.params.index > session.problems.length) {
    return next(new AppError('Invalid index', 400));
  }

  session.problems[req.params.index - 1].isSolved =
    !session.problems[req.params.index - 1].isSolved;

  session.solvedCount = session.problems.reduce(
    (count, problem) => count + (problem.isSolved ? 1 : 0),
    0
  );

  session.save();

  res.status(200).json({
    status: 'success',
    data: {
      session,
    },
  });
});
