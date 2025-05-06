const express = require("express");
const router = express.Router();
const { verifyEmail } = require("../middlewares/validation");
const { hashPassword, verifyPassword } = require("../middlewares/hashPassword");
const { verifyToken } = require("../middlewares/auth");

const {
    getCurrentUser,
    registerUser,
    loginUser
} = require("../controllers/usersController");

router.get("/me", verifyToken, getCurrentUser);
router.get("/signup", (req, res) => res.send("Hello from signup test route"));

router.post("/signup", verifyEmail("signup"), hashPassword, registerUser);
router.post("/login", verifyEmail("login"), verifyPassword, loginUser);

module.exports = router;
