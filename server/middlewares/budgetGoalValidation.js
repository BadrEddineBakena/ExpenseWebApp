const moment = require("moment");

const validateDates = (req, res, next) => {
  const { startDate, endDate } = req.body;
  const startMoment = moment(startDate, moment.ISO_8601, true);
  const endMoment = moment(endDate, moment.ISO_8601, true);
  
  if (!startMoment.isValid()) {
    return res.status(400).json({ error: "Invalid start date" });
  }
  
  if (!endMoment.isValid()) {
    return res.status(400).json({ error: "Invalid end date" });
  }
  
  if (endMoment.isSameOrBefore(startMoment)) {
    return res.status(400).json({ error: "End date must be after start date" });
  }
  
  next();
};

const validateAmount = (req, res, next) => {
  const { amount } = req.body;
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: "Amount must be a positive number" });
  }
  next();
};

const validateExistence = (req, res, next) => {
  const { amount, startDate, endDate } = req.body;
  if (!amount || !startDate || !endDate) {
    return res.status(400).json({ error: "Missing required fields: amount, startDate, endDate" });
  }
  next();
};

module.exports = {
  validateDates,
  validateAmount,
  validateExistence
}; 