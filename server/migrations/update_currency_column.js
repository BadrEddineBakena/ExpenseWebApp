'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'currency', {
      type: Sequelize.STRING(10),
      allowNull: true,
      defaultValue: 'MAD'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Users', 'currency', {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'USD'
    });
  }
}; 