const express = require('express');
const authMiddlewares = require('../middlewares/authMiddlewares');
const userController = require('../controllers/userController');
const friendshipRouter = require('../routes/friendshipRoutes');

const router = express.Router();

router.use(authMiddlewares.protect);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/me', userController.updateMe);
router.delete(
  '/me',
  authMiddlewares.checkPassword,
  userController.deactivateMe
);

router.use('/me', friendshipRouter);

router.route('/').get(userController.limitUserFields, userController.getUsers);

router
  .route('/:id')
  .get(userController.limitUserFields, userController.getUser)
  .patch(
    authMiddlewares.restrictTo('admin'),
    authMiddlewares.checkPassword,
    userController.promoteUser
  );

router
  .route('/toggle-status/:id')
  .patch(
    authMiddlewares.restrictTo('admin'),
    authMiddlewares.checkPassword,
    userController.toggleUserStatus
  );

module.exports = router;
