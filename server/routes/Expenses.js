const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { addExpense, getExpenses, getExpenseById, updateExpense, deleteExpense } = require('../controllers/expensesController');
const { validateDate, validateAmount, validateExistence } = require('../middlewares/expenseValidation');

// POST /expenses
router.post('/', verifyToken, validateDate, validateAmount, validateExistence, addExpense);

// GET /expenses
router.get('/', verifyToken, getExpenses);

// GET /expenses/:id
router.get('/:id', verifyToken, getExpenseById);

// PUT /expenses/:id
router.put('/:id', verifyToken, validateDate, validateAmount, updateExpense);

// DELETE /expenses/:id
router.delete('/:id', verifyToken, deleteExpense);

module.exports = router;
