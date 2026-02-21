const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getCodes, createCode, toggleCode, deleteCode, validateCode } = require('../controllers/discountCodeController');

router.use(authenticate);
router.get('/', getCodes);
router.post('/validate', validateCode);          // any cashier can validate
router.post('/', requireAdmin, createCode);
router.patch('/:id/toggle', requireAdmin, toggleCode);
router.delete('/:id', requireAdmin, deleteCode);

module.exports = router;
