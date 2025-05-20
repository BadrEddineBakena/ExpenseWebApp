const Users = require("../models/Users");

const verifyUsername = async (req, res, next) => {
  console.log("verifyUsername middleware called");
  const { username } = req.body;
  console.log("Username received:", username ? username : "None");
  if (!username) return next(); 
  try {
    console.log("Checking if username exists...");
    const existingUser = await Users.findOne({ where: { username } });
    console.log("Username exists:", existingUser ? "Yes" : "No");
    if (existingUser && existingUser.userID !== req.userID) {  // Check userID
      return res.status(400).json({ error: "Username already taken" });
    }
    if (username && (username.length < 3 || /\s/.test(username))) {
      return res.status(400).json({ error: "Username must be at least 3 characters and contain no spaces" });
    }
    console.log("Username validation successful");
    next();
  } catch (err) {
    console.error("Error in verifyUsername middleware:", err);
    res.status(500).json({ error: "Error verifying username" });
  }
};

module.exports = { verifyUsername };
