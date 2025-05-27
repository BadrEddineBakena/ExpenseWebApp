const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BudgetGoals = sequelize.define('BudgetGoals', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isAfterStartDate(value) {
        if (new Date(value) <= new Date(this.startDate)) {
          throw new Error('endDate must be after startDate');
        }
      },
    },
  },
  category: {
    type: DataTypes.STRING(50),
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'userID' },
  },
  currency: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'MAD'
  },
}, {
  timestamps: false,
});

module.exports = BudgetGoals;
