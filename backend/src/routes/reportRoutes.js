const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getDashboardStats, getFullDashboardStats, getDailySales, getProfitAnalysis, getTrendData, getAdvancedAnalytics } = require('../controllers/reportController');
const { requirePlan } = require('../middleware/planMiddleware');
const { getEndOfDay } = require('../controllers/endOfDayController');

const { requireAdmin } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/fullstats', requirePlan('gold'), getFullDashboardStats);
router.get('/daily', requireAdmin, requirePlan('gold'), getDailySales);
router.get('/profit', requireAdmin, requirePlan('gold'), getProfitAnalysis);
router.get('/trend', requireAdmin, requirePlan('gold'), getTrendData);
router.get('/advanced', requireAdmin, requirePlan('gold'), getAdvancedAnalytics);
router.get('/end-of-day', requireAdmin, requirePlan('gold'), getEndOfDay);

module.exports = router;

