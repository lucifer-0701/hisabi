const express = require('express');
const router = express.Router();
const duePaymentController = require('../controllers/duePaymentController');
const auth = require('../middleware/auth');

router.use(auth.authenticate);

router.get('/pending', duePaymentController.getPendingDues);
router.post('/collect', duePaymentController.collectPayment);
router.get('/stats', duePaymentController.getDueStats);
router.get('/history', duePaymentController.getDueHistoryEntries);
router.get('/:id/receipt', duePaymentController.downloadDueReceipt);

module.exports = router;
