const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { getDashboardSummary } = require('../controllers/dashboardController');

router.get('/', verifyToken, getDashboardSummary);

module.exports = router; 