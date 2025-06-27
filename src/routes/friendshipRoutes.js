const express = require('express');
const authMiddlewares = require('../middlewares/authMiddlewares');
const friendshipController = require('../controllers/friendshipController');

const router = express.Router();

router.use(authMiddlewares.protect);

router.route('/friends').get(friendshipController.getFriends);
router.route('/friends/:id').delete(friendshipController.removeFriend);

router.route('/blocked').get(friendshipController.getBlockedUsers);
router
  .route('/blocked/:id')
  .post(friendshipController.blockUser)
  .delete(friendshipController.unblockUser);

router.get('/requests/summary', friendshipController.getRequestSummary);
router
  .route('/requests/:id')
  .post(friendshipController.sendRequest)
  .delete(friendshipController.cancelRequest);

router.route('/requests/:id/accept').patch(friendshipController.acceptRequest);
router.route('/requests/:id/reject').patch(friendshipController.rejectRequest);

router.get(
  '/requests/sent/pending',
  friendshipController.setStatus('pending'),
  friendshipController.getSentRequests
);

router.get(
  '/requests/sent/rejected',
  friendshipController.setStatus('rejected'),
  friendshipController.getSentRequests
);

router.get(
  '/requests/received/pending',
  friendshipController.setStatus('pending'),
  friendshipController.getReceivedRequests
);

router.get(
  '/requests/received/rejected',
  friendshipController.setStatus('rejected'),
  friendshipController.getReceivedRequests
);

module.exports = router;
