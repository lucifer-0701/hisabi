const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
    createInvoice,
    listInvoices,
    getInvoice,
    downloadInvoicePDF,
    deleteInvoice,
    updatePayment,
    invoiceSchema
} = require('../controllers/invoiceController');

// All invoice routes require authentication
router.use(authenticate);

// Staff and Admin can create and view invoices
router.post('/', validate(invoiceSchema), createInvoice);
router.get('/', listInvoices);
router.get('/:id', getInvoice);
router.get('/:id/pdf', downloadInvoicePDF);
router.patch('/:id/payment', updatePayment);
router.delete('/:id', deleteInvoice);

module.exports = router;
