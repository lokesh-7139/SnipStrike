const express = require('express');
const authMiddlewares = require('../middlewares/authMiddlewares');
const badgeController = require('../controllers/badgeController');

const router = express.Router();

router.use(authMiddlewares.protect);

router
  .route('/')
  .get(badgeController.getBadges)
  .post(authMiddlewares.restrictTo('admin'), badgeController.createBadge);

router
  .route('/:id')
  .get(badgeController.getBadge)
  .delete(authMiddlewares.restrictTo('admin'), badgeController.deleteBadge);

router
  .route('/toggle-status/:id')
  .patch(
    authMiddlewares.restrictTo('admin'),
    badgeController.toggleBadgeStatus
  );

module.exports = router;
