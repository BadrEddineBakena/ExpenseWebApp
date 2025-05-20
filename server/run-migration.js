const { sequelize } = require('./models');
const currencyMigration = require('./migrations/update_currency_column');
const ageMigration = require('./migrations/update_age_column');

async function runMigrations() {
  try {
    console.log('Running migrations...');
    
    console.log('Updating currency column...');
    await currencyMigration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('Updating age column...');
    await ageMigration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations(); 