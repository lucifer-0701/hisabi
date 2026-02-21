const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
    listProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    productSchema
} = require('../controllers/productController');

const upload = require('../middleware/upload');

// All product routes require authentication
router.use(authenticate);

// Staff and Admin can view products
router.get('/', listProducts);
router.get('/:id', getProduct);

// Only Admin can manage products
router.post('/', authorize(['admin']), upload.single('image'), validate(productSchema), createProduct);
router.put('/:id', authorize(['admin']), upload.single('image'), validate(productSchema), updateProduct);
router.delete('/:id', authorize(['admin']), deleteProduct);

module.exports = router;
