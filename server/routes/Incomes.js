const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { addIncome, getIncomes, getIncomeById, updateIncome, deleteIncome } = require('../controllers/incomesController');
const { validateDate, validateAmount, validateExistence } = require('../middlewares/incomeValidation');

// POST /incomes
router.post('/', verifyToken, validateDate, validateAmount, validateExistence, addIncome);

// GET /incomes
router.get('/', verifyToken, getIncomes);

// GET /incomes/:id
router.get('/:id', verifyToken, getIncomeById);

// PUT /incomes/:id
router.put('/:id', verifyToken, validateDate, validateAmount, updateIncome);

// DELETE /incomes/:id
router.delete('/:id', verifyToken, deleteIncome);

module.exports = router; 