'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add currency column to Expenses
    await queryInterface.addColumn('Expenses', 'currency', {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'MAD'
    });

    // Add currency column to Incomes
    await queryInterface.addColumn('Incomes', 'currency', {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'MAD'
    });

    // Add currency column to BudgetGoals
    await queryInterface.addColumn('BudgetGoals', 'currency', {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'MAD'
    });

    // Update existing records to use the user's current currency
    const users = await queryInterface.sequelize.query('SELECT userID, currency FROM Users;', { type: queryInterface.sequelize.QueryTypes.SELECT });
    for (const user of users) {
      await queryInterface.sequelize.query(`UPDATE Expenses SET currency = '${user.currency}' WHERE userId = ${user.userID};`);
      await queryInterface.sequelize.query(`UPDATE Incomes SET currency = '${user.currency}' WHERE userId = ${user.userID};`);
      await queryInterface.sequelize.query(`UPDATE BudgetGoals SET currency = '${user.currency}' WHERE userId = ${user.userID};`);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Expenses', 'currency');
    await queryInterface.removeColumn('Incomes', 'currency');
    await queryInterface.removeColumn('BudgetGoals', 'currency');
  }
}; 