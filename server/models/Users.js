const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');  

const Users = sequelize.define('Users', {
  userID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullname: {
    type: DataTypes.STRING(50),  
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(50), 
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  phoneNumber: {
    type: DataTypes.STRING(20), 
    unique: true,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 0 },
  },
  currency: {
    type: DataTypes.STRING(10),  
    allowNull: true,
    defaultValue: 'MAD'
  },
  password_hash: {
    type: DataTypes.STRING(255), 
    allowNull: false,
  },
  resetToken: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  resetTokenExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,  
    defaultValue: DataTypes.NOW,
  },
  profileComplete: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  twoFactorEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  twoFactorSecret: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  backupCodes: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  theme: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: 'light',
  },
  notifications: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: { email: false, budgetAlerts: false },
  },
}, {
  timestamps: false,  
});

module.exports = Users;
