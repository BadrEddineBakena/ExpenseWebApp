

const express = require('express');
const router = express.Router();
const { loginUser, refreshToken, logoutUser } = require('../controllers/authController');
const { verifyPassword } = require('../middlewares/hashPassword');  // to verify credentials

// POST /users/login
const { body } = require('express-validator');
router.post('/login', [
  body('email').notEmpty().isEmail(),
  body('password').notEmpty(),
], verifyPassword, loginUser);

// POST /auth/refresh
router.post('/refresh', refreshToken);

// POST /auth/logout
router.post('/logout', logoutUser);

module.exports = router;
