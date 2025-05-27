// usersRoutes.js

const express = require('express');
const router = express.Router();
const {
  getCurrentUser,
  registerUser,
  updateUserInfo,
  forgotPassword,
  resetPassword,
  setup2FA,
  verify2FA,
  disable2FA,
  updateNotificationPreferences,
  updateTheme,
} = require('../controllers/usersController');
const { verifyToken } = require('../middlewares/auth');
const { verifyEmail, validateCurrency } = require('../middlewares/validation');
const { hashPassword, verifyPassword } = require('../middlewares/hashPassword');
const { verifyUsername } = require('../middlewares/verifyUsername');

// GET /users/me
router.get('/me', verifyToken, getCurrentUser);

// POST /users/signup
router.post(
  '/signup',
  verifyEmail('signup'),
  hashPassword,
  verifyUsername,
  registerUser
);

// PUT /users/:id
router.put('/:id', verifyToken, verifyUsername, validateCurrency, updateUserInfo);

// POST /users/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /users/reset-password
router.post('/reset-password', resetPassword);

// 2FA routes
router.post('/2fa/setup', verifyToken, setup2FA);
router.post('/2fa/verify', verifyToken, verify2FA);
router.post('/2fa/disable', verifyToken, disable2FA);

// Notification preferences
router.put('/:id/notifications', verifyToken, updateNotificationPreferences);

// Theme preferences
router.put('/:id/theme', verifyToken, updateTheme);

module.exports = router;
