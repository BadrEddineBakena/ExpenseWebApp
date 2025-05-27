const Incomes = require("../models/Incomes");
const Users = require("../models/Users");
const { convertAmount } = require("../utils/currencyConversion");

const addIncome = async (req, res) => {
  try {
    const user = await Users.findByPk(req.userID);
    const newIncome = await Incomes.create({
      ...req.body,
      userId: req.userID,
      currency: user.currency
    });
    res.status(201).json(newIncome);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getIncomes = async (req, res) => {
  try {
    const user = await Users.findByPk(req.userID);
    const userCurrency = user.currency;
    const incomes = await Incomes.findAll({
      where: { userId: req.userID }
    });
    const convertedIncomes = incomes.map(inc => ({
      ...inc.toJSON(),
      amount: convertAmount(parseFloat(inc.amount), inc.currency, userCurrency)
    }));
    res.json(convertedIncomes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch incomes" });
  }
};

const getIncomeById = async (req, res) => {
  try {
    const user = await Users.findByPk(req.userID);
    const userCurrency = user.currency;
    const income = await Incomes.findOne({
      where: {
        id: req.params.id,
        userId: req.userID
      }
    });

    if (!income) {
      return res.status(404).json({ error: "Income not found" });
    }

    const convertedIncome = {
      ...income.toJSON(),
      amount: convertAmount(parseFloat(income.amount), income.currency, userCurrency)
    };
    res.json(convertedIncome);
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
      const user = await Users.findByPk(req.userID);
      const userCurrency = user.currency;
      const convertedIncome = {
        ...updatedIncome.toJSON(),
        amount: convertAmount(parseFloat(updatedIncome.amount), updatedIncome.currency, userCurrency)
      };
      return res.status(200).json(convertedIncome);
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