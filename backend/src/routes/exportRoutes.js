const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requirePlan } = require('../middleware/planMiddleware');
const { exportSalesCSV, exportSalesPDF } = require('../controllers/exportController');

router.get('/sales-csv', authenticate, requirePlan('gold'), exportSalesCSV);
router.get('/sales-pdf', authenticate, requirePlan('gold'), exportSalesPDF);

module.exports = router;
