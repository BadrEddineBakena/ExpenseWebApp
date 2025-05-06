const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reports = sequelize.define('Reports', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  period: {
    type: DataTypes.STRING(20),  // e.g., "March 2025" or "2025-Q1"
    allowNull: false,
  },
  totalExpense: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  totalIncome: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  dateGenerated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'userID' },
  },
}, {
  timestamps: false,
});

module.exports = Reports;
