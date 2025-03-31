const {Sequelize} = require("sequelize")


const sequelize = new Sequelize('ExpenseApp','badreddine','badr1234',{
    host : 'localhost',
    dialect : 'mariadb',
    logging : console.log
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully!');
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
  });

module.exports = sequelize