const sequelize = require('../config/database');
const Users = require('./Users');
const Expenses = require('./Expenses');
const Incomes = require('./Incomes');
const BudgetGoals = require('./BudgetGoals');
const Reports = require('./Reports');

// Define associations
Users.hasMany(Expenses, { foreignKey: 'userId' });
Expenses.belongsTo(Users, { foreignKey: 'userId' });

Users.hasMany(Incomes, { foreignKey: 'userId' });
Incomes.belongsTo(Users, { foreignKey: 'userId' });

Users.hasMany(BudgetGoals, { foreignKey: 'userId' });
BudgetGoals.belongsTo(Users, { foreignKey: 'userId' });

Users.hasMany(Reports, { foreignKey: 'userId' });
Reports.belongsTo(Users, { foreignKey: 'userId' });

// Export all models and sequelize
module.exports = {
  sequelize,
  Users,
  Expenses,
  Incomes,
  BudgetGoals,
  Reports,
};
