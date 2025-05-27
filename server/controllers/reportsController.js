const Reports = require("../models/Reports");
const Expenses = require("../models/Expenses");
const Incomes = require("../models/Incomes");
const Users = require("../models/Users");
const { Op } = require("sequelize");
const moment = require("moment");
const { convertAmount } = require("../utils/currencyConversion");

const generateReport = async (req, res) => {
  try {
    const { startDate, endDate, period } = req.body;
    
    if (!startDate || !endDate || !period) {
      return res.status(400).json({ error: "Missing required fields: startDate, endDate, period" });
    }

    // Validate date range
    const start = moment(startDate);
    const end = moment(endDate);
    
    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    
    if (end.isBefore(start)) {
      return res.status(400).json({ error: "End date must be after start date" });
    }

    const user = await Users.findByPk(req.userID);
    const userCurrency = user.currency;

    // Get expenses for the period
    const expenses = await Expenses.findAll({
      where: {
        userId: req.userID,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Get incomes for the period
    const incomes = await Incomes.findAll({
      where: {
        userId: req.userID,
        date: {
          [Op.between]: [startDate, endDate]
        }
      }
    });

    // Calculate totals (convert amounts)
    const totalExpense = expenses.reduce((sum, expense) => 
      sum + convertAmount(parseFloat(expense.amount), expense.currency, userCurrency), 0);
    const totalIncome = incomes.reduce((sum, income) => 
      sum + convertAmount(parseFloat(income.amount), income.currency, userCurrency), 0);
    const balance = totalIncome - totalExpense;

    // Check if a report for this period already exists
    const existingReport = await Reports.findOne({
      where: {
        userId: req.userID,
        period
      }
    });

    let report;
    
    if (existingReport) {
      // Update existing report
      await existingReport.update({
        totalExpense,
        totalIncome,
        balance,
        dateGenerated: new Date()
      });
      report = existingReport;
    } else {
      // Create new report
      report = await Reports.create({
        period,
        totalExpense,
        totalIncome,
        balance,
        userId: req.userID
      });
    }

    // Include breakdown details for the client (convert amounts)
    const reportWithDetails = {
      ...report.toJSON(),
      details: {
        expenses: expenses.map(exp => ({
          id: exp.id,
          amount: convertAmount(parseFloat(exp.amount), exp.currency, userCurrency),
          date: exp.date,
          category: exp.category,
          description: exp.description
        })),
        incomes: incomes.map(inc => ({
          id: inc.id,
          amount: convertAmount(parseFloat(inc.amount), inc.currency, userCurrency),
          date: inc.date,
          source: inc.source,
          description: inc.description
        })),
        expensesByCategory: expenses.reduce((acc, exp) => {
          const category = exp.category || 'Uncategorized';
          if (!acc[category]) acc[category] = 0;
          acc[category] += convertAmount(parseFloat(exp.amount), exp.currency, userCurrency);
          return acc;
        }, {})
      }
    };

    res.status(201).json(reportWithDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Reports.findAll({
      where: { userId: req.userID },
      order: [['dateGenerated', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Reports.findOne({
      where: {
        id: req.params.id,
        userId: req.userID
      }
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const user = await Users.findByPk(req.userID);
    const userCurrency = user.currency;

    // Get the current date for the start and one month later for the end
    // This is a fallback in case we can't parse the period into a date range
    let periodStart = moment().startOf('month').format('YYYY-MM-DD');
    let periodEnd = moment().endOf('month').format('YYYY-MM-DD');
    
    // Try to determine the date range from the period
    if (report.period) {
      // Check if period looks like a date range with a hyphen
      if (report.period.includes('-')) {
        try {
          const parts = report.period.split('-');
          // Only trim and parse if both parts exist
          if (parts.length === 2) {
            const startDate = moment(parts[0].trim(), 'YYYY-MM-DD');
            const endDate = moment(parts[1].trim(), 'YYYY-MM-DD');
            
            if (startDate.isValid() && endDate.isValid()) {
              periodStart = startDate.format('YYYY-MM-DD');
              periodEnd = endDate.format('YYYY-MM-DD');
            }
          }
        } catch (error) {
          console.error("Error parsing date range:", error);
          // Continue with fallback dates
        }
      } else {
        // Try to parse month/year format like "June 2024"
        try {
          const date = moment(report.period, 'MMMM YYYY');
          if (date.isValid()) {
            periodStart = date.startOf('month').format('YYYY-MM-DD');
            periodEnd = date.endOf('month').format('YYYY-MM-DD');
          }
        } catch (error) {
          console.error("Error parsing month/year:", error);
          // Continue with fallback dates
        }
      }
    }

    // Fetch detailed data for the report using the determined date range
    const expenses = await Expenses.findAll({
      where: {
        userId: req.userID,
        date: {
          [Op.between]: [periodStart, periodEnd]
        }
      }
    });

    const incomes = await Incomes.findAll({
      where: {
        userId: req.userID,
        date: {
          [Op.between]: [periodStart, periodEnd]
        }
      }
    });

    // Prepare the detailed report (convert amounts)
    const detailedReport = {
      ...report.toJSON(),
      details: {
        periodStart, // Include the calculated date range in the response
        periodEnd,
        expenses: expenses.map(exp => ({
          id: exp.id,
          amount: convertAmount(parseFloat(exp.amount), exp.currency, userCurrency),
          date: exp.date,
          category: exp.category,
          description: exp.description
        })),
        incomes: incomes.map(inc => ({
          id: inc.id,
          amount: convertAmount(parseFloat(inc.amount), inc.currency, userCurrency),
          date: inc.date,
          source: inc.source,
          description: inc.description
        })),
        expensesByCategory: expenses.reduce((acc, exp) => {
          const category = exp.category || 'Uncategorized';
          if (!acc[category]) acc[category] = 0;
          acc[category] += convertAmount(parseFloat(exp.amount), exp.currency, userCurrency);
          return acc;
        }, {})
      }
    };

    res.json(detailedReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateReport,
  getReports,
  getReportById
}; 