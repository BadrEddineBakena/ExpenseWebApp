const { sequelize } = require('../models'); 
const Expenses = require('../models/Expenses');
const Incomes = require('../models/Incomes');
const Users = require('../models/Users');
const { Op } = require('sequelize');
const { convertAmount } = require('../utils/currencyConversion');

const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.userID;
    const user = await Users.findByPk(userId);
    const userCurrency = user.currency;

    // Fetch expenses and convert amounts
    const expenses = await Expenses.findAll({ where: { userId } });
    const totalExpenses = expenses.reduce((sum, exp) => 
      sum + convertAmount(parseFloat(exp.amount), exp.currency, userCurrency), 0);

    // Fetch incomes and convert amounts
    const incomes = await Incomes.findAll({ where: { userId } });
    const totalIncomes = incomes.reduce((sum, inc) => 
      sum + convertAmount(parseFloat(inc.amount), inc.currency, userCurrency), 0);

    // Total Savings
    const totalSavings = totalIncomes - totalExpenses;

    // Recent Expenses (convert amounts)
    const recentExpenses = expenses.slice(0, 5).map(exp => ({
      ...exp.toJSON(),
      amount: convertAmount(parseFloat(exp.amount), exp.currency, userCurrency)
    }));

    // Expenses by Category (convert amounts)
    const expensesByCategoryRaw = await Expenses.findAll({
      where: { userId },
      attributes: ['category', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      group: ['category']
    });
    const expensesByCategory = expensesByCategoryRaw.map(e => ({
      category: e.category,
      total: convertAmount(parseFloat(e.dataValues.total), e.currency, userCurrency)
    }));

    // Monthly Data (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const monthExpenses = await Expenses.findAll({
        where: {
          userId,
          date: { [Op.between]: [monthStart, monthEnd] }
        }
      });
      const monthExpensesTotal = monthExpenses.reduce((sum, exp) => 
        sum + convertAmount(parseFloat(exp.amount), exp.currency, userCurrency), 0);

      const monthIncomes = await Incomes.findAll({
        where: {
          userId,
          date: { [Op.between]: [monthStart, monthEnd] }
        }
      });
      const monthIncomesTotal = monthIncomes.reduce((sum, inc) => 
        sum + convertAmount(parseFloat(inc.amount), inc.currency, userCurrency), 0);

      monthlyData.unshift({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        expenses: monthExpensesTotal,
        incomes: monthIncomesTotal
      });
    }

    res.json({
      totalExpenses,
      totalIncomes,
      totalSavings,
      recentExpenses,
      expensesByCategory,
      monthlyData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDashboardSummary }; 