const BudgetGoals = require("../models/BudgetGoals");
const Expenses = require("../models/Expenses");
const Users = require("../models/Users");
const { Op } = require("sequelize");
const { convertAmount } = require("../utils/currencyConversion");

const addBudgetGoal = async (req, res) => {
  try {
    const user = await Users.findByPk(req.userID);
    const newBudgetGoal = await BudgetGoals.create({
      ...req.body,
      userId: req.userID,
      currency: user.currency
    });
    res.status(201).json(newBudgetGoal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBudgetGoals = async (req, res) => {
  try {
    const user = await Users.findByPk(req.userID);
    const userCurrency = user.currency;
    const budgetGoals = await BudgetGoals.findAll({
      where: { userId: req.userID }
    });
    const convertedGoals = budgetGoals.map(goal => ({
      ...goal.toJSON(),
      amount: convertAmount(parseFloat(goal.amount), goal.currency, userCurrency)
    }));
    res.json(convertedGoals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch budget goals" });
  }
};

const getBudgetGoalById = async (req, res) => {
  try {
    const user = await Users.findByPk(req.userID);
    const userCurrency = user.currency;
    const budgetGoal = await BudgetGoals.findOne({
      where: {
        id: req.params.id,
        userId: req.userID
      }
    });

    if (!budgetGoal) {
      return res.status(404).json({ error: "Budget goal not found" });
    }

    const convertedGoal = {
      ...budgetGoal.toJSON(),
      amount: convertAmount(parseFloat(budgetGoal.amount), budgetGoal.currency, userCurrency)
    };
    res.json(convertedGoal);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the budget goal data" });
  }
};

const updateBudgetGoal = async (req, res) => {
  try {
    const [updated] = await BudgetGoals.update(req.body, {
      where: { 
        id: req.params.id,
        userId: req.userID 
      }
    });
    
    if (updated) {
      const updatedBudgetGoal = await BudgetGoals.findOne({
        where: { 
          id: req.params.id,
          userId: req.userID
        }
      });
      const user = await Users.findByPk(req.userID);
      const userCurrency = user.currency;
      const convertedGoal = {
        ...updatedBudgetGoal.toJSON(),
        amount: convertAmount(parseFloat(updatedBudgetGoal.amount), updatedBudgetGoal.currency, userCurrency)
      };
      return res.status(200).json(convertedGoal);
    }
    
    return res.status(404).json({ error: "Budget goal not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteBudgetGoal = async (req, res) => {
  try {
    const deleted = await BudgetGoals.destroy({
      where: { 
        id: req.params.id,
        userId: req.userID 
      }
    });
    
    if (deleted) {
      return res.status(200).json({ message: "Budget goal deleted successfully" });
    }
    
    return res.status(404).json({ error: "Budget goal not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getBudgetGoalsProgress = async (req, res) => {
  try {
    const user = await Users.findByPk(req.userID);
    const userCurrency = user.currency;
    const budgetGoals = await BudgetGoals.findAll({
      where: { userId: req.userID }
    });

    const progressData = await Promise.all(budgetGoals.map(async (goal) => {
      // Find expenses in the date range and category (if specified)
      const whereClause = {
        userId: req.userID,
        date: {
          [Op.between]: [goal.startDate, goal.endDate]
        }
      };
      
      // Add category filter if the goal has a specific category
      if (goal.category) {
        whereClause.category = goal.category;
      }
      
      // Calculate total expenses for this goal
      const expenses = await Expenses.findAll({
        where: whereClause,
        attributes: ['amount', 'currency']
      });
      
      const totalSpent = expenses.reduce((sum, expense) => 
        sum + convertAmount(parseFloat(expense.amount), expense.currency, userCurrency), 0);
      const budgetAmount = convertAmount(parseFloat(goal.amount), goal.currency, userCurrency);
      const remainingBudget = budgetAmount - totalSpent;
      const percentUsed = (totalSpent / budgetAmount) * 100;
      
      return {
        goalId: goal.id,
        category: goal.category || 'All categories',
        startDate: goal.startDate,
        endDate: goal.endDate,
        budgetAmount,
        totalSpent,
        remainingBudget,
        percentUsed,
        isOverBudget: totalSpent > budgetAmount
      };
    }));
    
    res.status(200).json(progressData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { 
  addBudgetGoal, 
  getBudgetGoals, 
  getBudgetGoalById, 
  updateBudgetGoal, 
  deleteBudgetGoal,
  getBudgetGoalsProgress
}; 