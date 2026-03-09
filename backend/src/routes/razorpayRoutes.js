const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createOrder, verifyPayment, handleWebhook } = require('../controllers/razorpayController');

// Authenticated endpoints
router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);

// Webhook: NO JWT auth — uses Razorpay signature verification internally
// express.raw() is required so the raw buffer is available for HMAC signing
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
