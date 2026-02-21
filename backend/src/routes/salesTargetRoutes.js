const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getTargets, setTarget } = require('../controllers/salesTargetController');

router.use(authenticate);
router.get('/', getTargets);
router.post('/', requireAdmin, setTarget);

module.exports = router;
