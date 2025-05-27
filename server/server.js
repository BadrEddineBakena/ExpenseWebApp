require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { sequelize } = require('./models');          
const usersRouter = require('./routes/Users');
const authRouter  = require('./routes/authRoutes');
const expensesRouter = require('./routes/Expenses');
const incomesRouter = require('./routes/Incomes');
const budgetGoalsRouter = require('./routes/BudgetGoals');
const reportsRouter = require('./routes/Reports');
const dashboardRouter = require('./routes/Dashboard');

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3001', process.env.CLIENT_URL].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Mount routers
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/expenses', expensesRouter);
app.use('/incomes', incomesRouter);
app.use('/budget-goals', budgetGoalsRouter);
app.use('/reports', reportsRouter);
app.use('/dashboard', dashboardRouter);

// Serve static files from the frontend build (Vite: client/dist)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all: send index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Root
app.get('/', (req, res) => res.send('Expense app is running…'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start
sequelize.sync()
  .then(() => {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch(err => console.error('DB sync error:', err));
