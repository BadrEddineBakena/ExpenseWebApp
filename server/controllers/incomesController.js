const Incomes = require("../models/Incomes");

const addIncome = async (req, res) => {
  try {
    const newIncome = await Incomes.create({
      ...req.body,
      userId: req.userID
    });
    res.status(201).json(newIncome);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getIncomes = async (req, res) => {
  try {
    const incomes = await Incomes.findAll({
      where: { userId: req.userID }
    });
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch incomes" });
  }
};

const getIncomeById = async (req, res) => {
  try {
    const income = await Incomes.findOne({
      where: {
        id: req.params.id,
        userId: req.userID
      }
    });

    if (!income) {
      return res.status(404).json({ error: "Income not found" });
    }

    res.json(income);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch the income data" });
  }
};

const updateIncome = async (req, res) => {
  try {
    const [updated] = await Incomes.update(req.body, {
      where: { 
        id: req.params.id,
        userId: req.userID 
      }
    });
    
    if (updated) {
      const updatedIncome = await Incomes.findOne({
        where: { 
          id: req.params.id,
          userId: req.userID
        }
      });
      return res.status(200).json(updatedIncome);
    }
    
    return res.status(404).json({ error: "Income not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const deleted = await Incomes.destroy({
      where: { 
        id: req.params.id,
        userId: req.userID 
      }
    });
    
    if (deleted) {
      return res.status(200).json({ message: "Income deleted successfully" });
    }
    
    return res.status(404).json({ error: "Income not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { addIncome, getIncomes, getIncomeById, updateIncome, deleteIncome }; 