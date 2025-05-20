const getDashboardSummary = async (req, res) => {
  // Dummy data for now
  res.json({
    totalExpenses: 0,
    totalIncomes: 0,
    totalSavings: 0,
    recentExpenses: [],
    expensesByCategory: [],
    monthlyData: []
  });
};

module.exports = { getDashboardSummary }; 