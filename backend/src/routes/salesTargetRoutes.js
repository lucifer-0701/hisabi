const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getTargets, setTarget } = require('../controllers/salesTargetController');
const { requirePlan } = require('../middleware/planMiddleware');

router.use(authenticate);
router.use(requirePlan('gold'));
router.get('/', getTargets);
router.post('/', requireAdmin, setTarget);

module.exports = router;
