const express = require('express');
const authMiddlewares = require('../middlewares/authMiddlewares');
const practiceMiddlewares = require('../middlewares/practiceMiddlewares');
const practiceController = require('../controllers/practiceController');

const router = express.Router();

router.use(authMiddlewares.protect);

router
  .route('/')
  .get(practiceController.getMySessions)
  .post(practiceController.createPracticeSession);

router
  .route('/:id')
  .get(
    practiceMiddlewares.checkSessionOwnership,
    practiceController.getPracticeSession
  )
  .delete(
    practiceMiddlewares.checkSessionOwnership,
    practiceController.deletePracticeSession
  );

router
  .route('/:id/:action(refresh|start|end)')
  .patch(
    practiceMiddlewares.checkSessionOwnership,
    practiceMiddlewares.checkSessionAction,
    practiceMiddlewares.handlePracticeSessionAction
  );

router
  .route('/:id/problems/:index/toggle-status')
  .patch(
    practiceMiddlewares.checkSessionOwnership,
    practiceMiddlewares.ensureSessionIsActive,
    practiceController.toggleProblemStatus
  );

module.exports = router;
