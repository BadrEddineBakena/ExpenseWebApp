const jwt = require('jsonwebtoken');

const generateAccessToken = (user) =>
  jwt.sign({ id: user.id || user.userID }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
  });

const generateRefreshToken = (user) =>
  jwt.sign({ id: user.id || user.userID }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });

module.exports = { generateAccessToken, generateRefreshToken };
