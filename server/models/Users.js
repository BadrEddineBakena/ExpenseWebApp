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
    type: DataTypes.STRING(50),  
    allowNull: false,
    unique: true,
  },
  phoneNumber: {
    type: DataTypes.STRING(20), 
    unique: true,
  },
  age: {
    type: DataTypes.INTEGER,  
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(10),  
    allowNull: false,
  },
  password_hash: {
    type: DataTypes.STRING(255), 
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,  
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,  
});

module.exports = Users;
