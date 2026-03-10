const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { listPurchases, createPurchase } = require('../controllers/purchaseController');
const { requirePlan } = require('../middleware/planMiddleware');

router.use(authenticate);
router.use(requirePlan('gold'));
router.get('/', listPurchases);
router.post('/', authorize(['admin']), createPurchase);

module.exports = router;
