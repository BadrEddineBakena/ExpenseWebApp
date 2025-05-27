'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'twoFactorEnabled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn('Users', 'twoFactorSecret', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'backupCodes', {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'theme', {
      type: Sequelize.STRING(10),
      allowNull: true,
      defaultValue: 'light',
    });

    await queryInterface.addColumn('Users', 'notifications', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: { email: false, budgetAlerts: false },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'twoFactorEnabled');
    await queryInterface.removeColumn('Users', 'twoFactorSecret');
    await queryInterface.removeColumn('Users', 'backupCodes');
    await queryInterface.removeColumn('Users', 'theme');
    await queryInterface.removeColumn('Users', 'notifications');
  }
}; 