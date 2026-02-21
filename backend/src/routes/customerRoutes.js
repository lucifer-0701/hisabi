const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { listCustomers, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');

router.use(authenticate);
router.get('/', listCustomers);
router.post('/', authorize(['admin']), createCustomer);
router.put('/:id', authorize(['admin']), updateCustomer);
router.delete('/:id', authorize(['admin']), deleteCustomer);

module.exports = router;
