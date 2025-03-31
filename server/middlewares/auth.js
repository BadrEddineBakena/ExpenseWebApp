const jwt = require("jsonwebtoken")
require('dotenv').config();


const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: "Access denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userID = decoded.userID;  
        req.email = decoded.email;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};


module.exports = {
    verifyToken
}   