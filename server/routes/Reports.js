const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const { generateReport, getReports, getReportById } = require('../controllers/reportsController');

// POST /reports - Generate a new report
router.post('/', verifyToken, generateReport);

// GET /reports - Get all reports for the user
router.get('/', verifyToken, getReports);

// GET /reports/:id - Get a specific report
router.get('/:id', verifyToken, getReportById);

module.exports = router; 