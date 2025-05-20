const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { 
  addBudgetGoal, 
  getBudgetGoals, 
  getBudgetGoalById, 
  updateBudgetGoal, 
  deleteBudgetGoal,
  getBudgetGoalsProgress
} = require('../controllers/budgetGoalsController');
const { validateDates, validateAmount, validateExistence } = require('../middlewares/budgetGoalValidation');

// POST /budget-goals
router.post('/', verifyToken, validateDates, validateAmount, validateExistence, addBudgetGoal);

// GET /budget-goals
router.get('/', verifyToken, getBudgetGoals);

// GET /budget-goals/progress
router.get('/progress', verifyToken, getBudgetGoalsProgress);

// GET /budget-goals/:id
router.get('/:id', verifyToken, getBudgetGoalById);

// PUT /budget-goals/:id
router.put('/:id', verifyToken, validateDates, validateAmount, updateBudgetGoal);

// DELETE /budget-goals/:id
router.delete('/:id', verifyToken, deleteBudgetGoal);

module.exports = router; 