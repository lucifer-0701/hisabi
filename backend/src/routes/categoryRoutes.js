const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');

router.use(authenticate);

router.post('/', createCategory);
router.get('/', getCategories);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
