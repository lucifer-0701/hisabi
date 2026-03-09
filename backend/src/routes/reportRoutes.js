const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getDashboardStats, getFullDashboardStats, getDailySales, getProfitAnalysis, getTrendData, getAdvancedAnalytics } = require('../controllers/reportController');
const { requirePlan } = require('../middleware/planMiddleware');
const { getEndOfDay } = require('../controllers/endOfDayController');

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/fullstats', getFullDashboardStats);
router.get('/daily', getDailySales);
router.get('/profit', getProfitAnalysis);
router.get('/trend', getTrendData);
router.get('/advanced', requirePlan('gold'), getAdvancedAnalytics);
router.get('/end-of-day', getEndOfDay);

module.exports = router;

