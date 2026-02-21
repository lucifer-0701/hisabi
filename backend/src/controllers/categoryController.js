const { Category, Product } = require('../models');

const createCategory = async (req, res) => {
    try {
        const { name, image_path } = req.body;
        const shop_id = req.user.shop_id;

        const category = await Category.create({
            shop_id,
            name,
            image_path
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
};

const getCategories = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const categories = await Category.findAll({
            where: { shop_id },
            include: [{ model: Product, attributes: ['id'] }] // Optional: count products
        });
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const shop_id = req.user.shop_id;
        const { name, image_path } = req.body;

        const category = await Category.findOne({ where: { id, shop_id } });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        category.name = name || category.name;
        category.image_path = image_path || category.image_path;
        await category.save();

        res.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const shop_id = req.user.shop_id;

        const category = await Category.findOne({ where: { id, shop_id } });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Check if category has products before deleting? 
        // For now, let's allow deletion and products become uncategorized (foreign key set to null if intended, but standard behavior might restrict)
        // Adjusting logic:
        const productCount = await Product.count({ where: { category_id: id } });
        if (productCount > 0) {
            // For user safety, prevent deleting non-empty categories or ask for confirmation to unlink
            // Simple path: Block deletion
            return res.status(400).json({ error: 'Cannot delete category with products. Move or delete products first.' });
        }

        await category.destroy();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
};

module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};
