const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getDashboardStats, getFullDashboardStats, getDailySales, getProfitAnalysis, getTrendData } = require('../controllers/reportController');
const { getEndOfDay } = require('../controllers/endOfDayController');

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/fullstats', getFullDashboardStats);
router.get('/daily', getDailySales);
router.get('/profit', getProfitAnalysis);
router.get('/trend', getTrendData);
router.get('/end-of-day', getEndOfDay);

module.exports = router;

