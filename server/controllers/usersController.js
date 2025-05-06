const Users = require("../models/Users");
const { generateToken } = require("../middlewares/tokenGen");

const getCurrentUser = async (req, res) => {
    try {
      const user = await Users.findByPk(req.userID, {
        attributes: { exclude: ['password_hash'] } 
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  };
  

const registerUser = async (req, res) => {
  try {
    const newUser = await Users.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Users.findOne({ where: { email } });
    const token = generateToken(user);
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getCurrentUser,
  registerUser,
  loginUser,
};
