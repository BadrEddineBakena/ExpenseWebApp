const Users = require("../models/Users");


const verifyEmail = (action) => {
    return async (req, res, next) => {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: "Email is required" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (action === "signup" && !emailRegex.test(email)) {
            return res.status(400).json({ msg: "Invalid email format" });
        }

        if (action === "signup") {

            const existingUser = await Users.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: "Email already in use" });
            }
        }
        else if (action === "login") {
            const existingUser = await Users.findOne({ where: { email } });
            if (!existingUser) {
                return res.status(404).json({ error: "The given email is not exist" });
            }
        }

        next();
    };
};

module.exports = {
    verifyEmail
};
