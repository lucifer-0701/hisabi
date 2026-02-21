const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { listPurchases, createPurchase } = require('../controllers/purchaseController');

router.use(authenticate);
router.get('/', listPurchases);
router.post('/', authorize(['admin']), createPurchase);

module.exports = router;
