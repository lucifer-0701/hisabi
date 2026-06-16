const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAdjustments, createAdjustment, getLowStock } = require('../controllers/stockAdjustmentController');

router.use(authenticate);
router.get('/low-stock', getLowStock);
router.get('/', getAdjustments);
router.post('/', authorize(['admin']), createAdjustment);

module.exports = router;
