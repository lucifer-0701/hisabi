const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createOrder, verifyPayment, handleWebhook } = require('../controllers/razorpayController');

// Authenticated endpoints
router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);

router.post('/webhook', handleWebhook);

module.exports = router;
