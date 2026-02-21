const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { listReturns, createReturn } = require('../controllers/returnController');

router.use(authenticate);
router.get('/', listReturns);
router.post('/', authorize(['admin']), createReturn);

module.exports = router;
