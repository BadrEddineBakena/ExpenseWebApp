const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Incomes = sequelize.define('Incomes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(255),
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

module.exports = Incomes;
