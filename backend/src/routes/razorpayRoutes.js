const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createOrder, verifyPayment, handleWebhook } = require('../controllers/razorpayController');

const { paymentLimiter } = require('../middleware/rateLimiter');

// Authenticated endpoints
router.post('/create-order', authenticate, paymentLimiter, createOrder);
router.post('/verify', authenticate, paymentLimiter, verifyPayment);

router.post('/webhook', paymentLimiter, handleWebhook);

module.exports = router;
