const express = require("express")
const router = express.Router()
const Users = require("../models/Users")
const { verifyEmail } = require("../middlewares/validation")
const { hashPassword,verifyPassword } = require("../middlewares/hashPassword")
const {verifyToken} = require("../middlewares/auth")
const {generateToken} = require("../middlewares/tokenGen")


router.get("/", async (req, res) => {
    const listUsers = await Users.findAll();
    res.json(listUsers);
})


router.post("/signup", verifyEmail("signup"),hashPassword, async (req, res) => {
    try {
        const newUser = await Users.create(req.body);
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



router.post("/login", verifyEmail("login"), verifyPassword, async (req, res) => {
    try {
        const { email } = req.body;
        const user = await Users.findOne({ where: { email } });

        const token = generateToken(user);

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});



module.exports = router