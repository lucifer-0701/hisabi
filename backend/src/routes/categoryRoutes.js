const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');

router.use(authenticate);

router.post('/', authorize(['admin']), createCategory);
router.get('/', getCategories);
router.put('/:id', authorize(['admin']), updateCategory);
router.delete('/:id', authorize(['admin']), deleteCategory);

module.exports = router;
