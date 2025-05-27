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

    const normalizedEmail = email.toLowerCase();
    if (action === "signup") {
      const existingUser = await Users.findOne({ where: { email: normalizedEmail } })
      req.body.email = normalizedEmail;
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
    } else if (action === "login") {
      const existingUser = await Users.findOne({ where: { email } });
      if (!existingUser) {
        return res.status(404).json({ error: "Email not found" });
      }
    }

    next();
  };
};

const validateCurrency = (req, res, next) => {
  const { currency } = req.body;
  const allowed = ['USD', 'EUR', 'MAD'];

  if (!currency || !allowed.includes(currency)) {
    return res.status(400).json({ error: `Invalid currency. Must be one of: ${allowed.join(', ')}` });
  }

  next();
};

module.exports = {
  verifyEmail,
  validateCurrency,
};
