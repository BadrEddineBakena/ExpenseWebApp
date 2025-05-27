const Expenses = require("../models/Expenses");
const Users = require("../models/Users");
const { convertAmount } = require("../utils/currencyConversion");

const addExpense = async (req, res) => {
  try {
    const user = await Users.findByPk(req.userID);
    const newExpense = await Expenses.create({
      ...req.body,
      userId: req.userID,
      currency: user.currency
    });
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const user = await Users.findByPk(req.userID);
    const userCurrency = user.currency;
    const exps = await Expenses.findAll({
      where: { userId: req.userID }
    });
    const convertedExpenses = exps.map(exp => ({
      ...exp.toJSON(),
      amount: convertAmount(parseFloat(exp.amount), exp.currency, userCurrency)
    }));
    res.json(convertedExpenses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const user = await Users.findByPk(req.userID);
    const userCurrency = user.currency;
    const expense = await Expenses.findOne({
      where: {
        id: req.params.id,
        userId: req.userID
      }
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    const convertedExpense = {
      ...expense.toJSON(),
      amount: convertAmount(parseFloat(expense.amount), expense.currency, userCurrency)
    };
    res.json(convertedExpense);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the expense data" });
  }
};

const updateExpense = async (req, res) => {
  try {
    const [updated] = await Expenses.update(req.body, {
      where: { 
        id: req.params.id,
        userId: req.userID 
      }
    });
    
    if (updated) {
      const updatedExpense = await Expenses.findOne({
        where: { 
          id: req.params.id,
          userId: req.userID
        }
      });
      const user = await Users.findByPk(req.userID);
      const userCurrency = user.currency;
      const convertedExpense = {
        ...updatedExpense.toJSON(),
        amount: convertAmount(parseFloat(updatedExpense.amount), updatedExpense.currency, userCurrency)
      };
      return res.status(200).json(convertedExpense);
    }
    
    return res.status(404).json({ error: "Expense not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const deleted = await Expenses.destroy({
      where: { 
        id: req.params.id,
        userId: req.userID 
      }
    });
    
    if (deleted) {
      return res.status(200).json({ message: "Expense deleted successfully" });
    }
    
    return res.status(404).json({ error: "Expense not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { addExpense, getExpenses, getExpenseById, updateExpense, deleteExpense };
