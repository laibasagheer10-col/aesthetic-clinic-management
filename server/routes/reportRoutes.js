const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/financial-summary', reportController.getFinancialSummary);

module.exports = router;