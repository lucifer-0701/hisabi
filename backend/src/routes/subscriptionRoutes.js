const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getSubscription, upgradePlan } = require('../controllers/subscriptionController');

router.get('/', authenticate, getSubscription);
router.post('/upgrade', authenticate, requireAdmin, upgradePlan);

module.exports = router;
