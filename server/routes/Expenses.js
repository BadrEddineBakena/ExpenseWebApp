const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth");
const { addExpense } = require("../controllers/expensesController");

router.post("/expenses", verifyToken, addExpense);

module.exports = router;
