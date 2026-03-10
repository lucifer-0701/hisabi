const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { listSuppliers, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { requirePlan } = require('../middleware/planMiddleware');

router.use(authenticate);
router.use(requirePlan('gold'));
router.get('/', listSuppliers);
router.post('/', authorize(['admin']), createSupplier);
router.put('/:id', authorize(['admin']), updateSupplier);
router.delete('/:id', authorize(['admin']), deleteSupplier);

module.exports = router;
