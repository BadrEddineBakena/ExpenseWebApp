const Users = require("../models/Users");

const bcrypt = require('bcryptjs')

const hashPassword = async (req, res, next) => {
    try {
        const { password } = req.body
        if (!password) {
            return res.status(400).json({ error: "password is required" })
        }
        const salt = await bcrypt.genSalt(10)
        req.body.password_hash = await bcrypt.hash(password, salt)
        delete req.body.password

        next()

    } catch (error) {
        res.status(500).json({ error: "internal server error " })
    }
}


const verifyPassword = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        
        const user = await Users.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }

        next(); 
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
module.exports = {
    hashPassword,
    verifyPassword
}


