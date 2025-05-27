const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    console.log(req.headers);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    const token = authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid token' });
      }
      req.userID = decoded.id; // Attach decoded userID to the request (using uppercase ID to match controller)
      next(); // Pass control to the next middleware/route handler
    });
  };

module.exports = { verifyToken };
