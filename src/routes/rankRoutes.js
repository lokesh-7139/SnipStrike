const express = require('express');
const authMiddlewares = require('../middlewares/authMiddlewares');
const rankController = require('../controllers/rankController');

const router = express.Router();

router
  .route('/')
  .get(rankController.getRanks)
  .post(
    authMiddlewares.protect,
    authMiddlewares.restrictTo('admin'),
    rankController.createRank
  );

router
  .route('/:id')
  .get(rankController.getRank)
  .patch(
    authMiddlewares.protect,
    authMiddlewares.restrictTo('admin'),
    authMiddlewares.checkPassword,
    rankController.updateRank
  )
  .delete(
    authMiddlewares.protect,
    authMiddlewares.restrictTo('admin'),
    authMiddlewares.checkPassword,
    rankController.deleteRank
  );

router.get('/by-points/:points', rankController.getRankByPoints);

module.exports = router;
