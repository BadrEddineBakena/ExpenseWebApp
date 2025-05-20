const jwt = require('jsonwebtoken');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');

const loginUser = async (req, res) => {
    const user = req.user; // The user object should now be set by the verifyPassword middleware
  
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
  
    const accessToken = generateAccessToken({ id: user.userID }); // user.userID is now accessible
    const refreshToken = generateRefreshToken({ id: user.userID });
  
    // Optionally persist refreshToken in DB here...
  
    res
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      })
      .status(200)
      .json({ accessToken });
  };
  

const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'No token' });

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    const newAccessToken = generateAccessToken({ id: decoded.id });
    res.json({ accessToken: newAccessToken });
  });
};

const logoutUser = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict',
  });
  res.status(200).json({ message: 'Logged out' });
};

module.exports = { loginUser, refreshToken, logoutUser };
