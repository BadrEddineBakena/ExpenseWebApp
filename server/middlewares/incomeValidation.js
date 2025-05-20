const Incomes = require("../models/Incomes");
const moment = require("moment");

const validateDate = (req, res, next) => {
  const { date } = req.body;
  const dateMoment = moment(date, moment.ISO_8601, true);
  
  if (!dateMoment.isValid() || dateMoment.isAfter(moment())) {
    return res.status(400).json({ error: "Invalid or future date" });
  }
  next();
};

const validateAmount = (req, res, next) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: "Invalid data; the amount must be positive" });
  }
  next();
};

const validateExistence = (req, res, next) => {
  const { amount, date, source } = req.body;
  if (!amount || !date || !source) {
    return res.status(400).json({ error: "Missing required fields: amount, date, source" });
  }
  next();
};

module.exports = {
  validateDate,
  validateAmount,
  validateExistence
}; 