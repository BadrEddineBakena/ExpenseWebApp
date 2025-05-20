const Users = require("../models/Users");

const bcrypt = require('bcryptjs')

const hashPassword = async (req, res, next) => {
    try {
        console.log("hashPassword middleware called");
        const { password } = req.body
        console.log("Password received:", password ? "Yes" : "No");
        if (!password) {
            return res.status(400).json({ error: "password is required" })
        }
        else if(password.length < 8){
            return res.status(400).json({error:"The length of the password must be 8 or more"})
        }
        console.log("Generating salt...");
        const salt = await bcrypt.genSalt(10)
        console.log("Salt generated, hashing password...");
        req.body.password_hash = await bcrypt.hash(password, salt)
        console.log("Password hashed successfully");
        delete req.body.password
        console.log("Moving to next middleware");
        next()

    } catch (error) {
      console.error("Error in hashPassword middleware:", error);
      res.status(500).json({ error: "Failed to hash password: " + error.message });
    }
}


const verifyPassword = async (req, res, next) => {
    try {
      console.log("verifyPassword middleware called");
      const { email, password } = req.body;
      console.log("Email and password received:", email ? "Yes" : "No", password ? "Yes" : "No");
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
  
      const user = await Users.findOne({ where: { email } });
      console.log("User found:", user ? "Yes" : "No");
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      console.log("Comparing passwords...");
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      console.log("Password match:", passwordMatch ? "Yes" : "No");
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid password" });
      }
      if (!/[A-Za-z0-9!@#$%^&*]/.test(password)) {
        return res.status(400).json({ error: "Password must include letters, numbers, and special characters" });
      }
  
      // Add the user to the request object for the next middleware
      req.user = user;
      console.log("Moving to next middleware");
      next(); 
    } catch (error) {
      console.error("Error in verifyPassword middleware:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
module.exports = {
    hashPassword,
    verifyPassword
}


