const PracticeSession = require('../models/practiceSessionModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const practiceController = require('../controllers/practiceController');

exports.checkSessionOwnership = catchAsync(async (req, res, next) => {
  const session = await PracticeSession.findById(req.params.id);

  if (!session) {
    return next(new AppError('Session not found', 404));
  }

  if (session.user.toString() !== req.user.id) {
    return next(
      new AppError('You are not authorized to view or modify this session', 403)
    );
  }

  req.targetPracticeSession = session;
  next();
});

exports.checkSessionAction = (req, res, next) => {
  const { action } = req.params;
  const session = req.targetPracticeSession;

  if (!['refresh', 'start', 'end'].includes(action)) {
    return next(new AppError('Invalid action', 400));
  }

  if (action === 'refresh') {
    if (session.status !== 'draft') {
      return next(
        new AppError('Cannot refresh problems after session has started', 400)
      );
    }
  }

  if (action === 'start') {
    if (session.status !== 'draft') {
      return next(new AppError('Session has already been started', 400));
    }
  }

  if (action === 'end') {
    if (session.status !== 'active') {
      return next(new AppError('Session not started or already ended', 400));
    }
  }

  next();
};

exports.handlePracticeSessionAction = (req, res, next) => {
  const { action } = req.params;

  if (action === 'refresh') {
    return practiceController.refreshSessionProblems(req, res, next);
  }
  if (action === 'start') {
    return practiceController.startPracticeSession(req, res, next);
  }
  if (action === 'end') {
    return practiceController.endPracticeSession(req, res, next);
  }
};

exports.ensureSessionIsActive = (req, res, next) => {
  if (req.targetPracticeSession.status === 'draft') {
    return next(new AppError('Start Session to make changes.', 400));
  } else if (req.targetPracticeSession.status === 'completed') {
    return next(new AppError('Cannot make changes in completed Session.', 400));
  }

  next();
};
