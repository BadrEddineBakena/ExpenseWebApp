const Expenses = require("../models/Expenses");

const addExpense = async (req, res) => {
  try {
    const newExpense = await Expenses.create({
      ...req.body,
      userId: req.userID  // Get user ID from token
    });
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const exps = await Expenses.findAll({
      where: { userId: req.userID } // Get expenses by userID
    });

    res.json(exps);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expense = await Expenses.findOne({
      where: {
        id: req.params.id,             
        userId: req.userID  // Ensure correct foreign key reference
      }
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.json(expense);
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
      return res.status(200).json(updatedExpense);
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
