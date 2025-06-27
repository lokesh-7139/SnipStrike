const express = require('express');
const authMiddlewares = require('../middlewares/authMiddlewares');
const authController = require('../controllers/authController');
const rateLimiters = require('../middlewares/rateLimiters');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/verify-email', authController.verifyEmail);
router.post(
  '/resend-verification-code',
  rateLimiters.verificationCodeLimiter,
  authController.resendEmailVerificationCode
);
router.post('/verify-cf-handle', authController.verifyCfHandle);
router.post(
  '/regenerate-verification-string',
  rateLimiters.verificationCodeLimiter,
  authController.regenerateCfVerificationString
);

router.post('/login', rateLimiters.loginLimiter, authController.login);
router.get('/logout', authController.logout);
router.post(
  '/forgotPassword',
  rateLimiters.forgotPasswordLimiter,
  authController.forgotPassword
);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authMiddlewares.protect);
router.patch('/updateMyPassword', authController.updatePassword);

module.exports = router;
