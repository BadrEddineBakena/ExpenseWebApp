const jwt = require("jsonwebtoken")
require('dotenv').config();
const generateToken = (user) => {
    return jwt.sign(
        { userID: user.userID, email: user.email }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
    );
};

module.exports = {generateToken}