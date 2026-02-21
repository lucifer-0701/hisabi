const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { listExpenses, createExpense, deleteExpense } = require('../controllers/expenseController');

router.use(authenticate);
router.get('/', listExpenses);
router.post('/', authorize(['admin']), createExpense);
router.delete('/:id', authorize(['admin']), deleteExpense);

module.exports = router;
