const { Op } = require('sequelize');
const { StockAdjustment, Product } = require('../models');

// GET /api/stock-adjustments — list all for shop
const getAdjustments = async (req, res) => {
    try {
        const adjustments = await StockAdjustment.findAll({
            where: { shop_id: req.user.shop_id },
            include: [
                { model: Product, as: 'product', attributes: ['id', 'name', 'stock_quantity'] }
            ],
            order: [['created_at', 'DESC']],
            limit: 200
        });
        res.json(adjustments);
    } catch (err) {
        console.error('getAdjustments:', err);
        res.status(500).json({ error: 'Failed to fetch adjustments' });
    }
};

// POST /api/stock-adjustments — create adjustment and update product stock
const createAdjustment = async (req, res) => {
    try {
        const { product_id, quantity_change, type, reason } = req.body;
        const shop_id = req.user.shop_id;

        if (!product_id || quantity_change === undefined) {
            return res.status(400).json({ error: 'product_id and quantity_change are required' });
        }

        const product = await Product.findOne({ where: { id: product_id, shop_id } });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Update stock
        const newStock = product.stock_quantity + parseInt(quantity_change);
        if (newStock < 0) return res.status(400).json({ error: 'Stock cannot go below 0' });

        product.stock_quantity = newStock;
        await product.save();

        const adjustment = await StockAdjustment.create({
            shop_id,
            product_id,
            quantity_change: parseInt(quantity_change),
            type: type || 'correction',
            reason: reason || null,
            adjusted_by: req.user.id
        });

        res.status(201).json({ adjustment, newStock });
    } catch (err) {
        console.error('createAdjustment:', err);
        res.status(500).json({ error: 'Failed to create adjustment' });
    }
};

// GET /api/stock-adjustments/low-stock — products below threshold
const getLowStock = async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 5;
        const products = await Product.findAll({
            where: {
                shop_id: req.user.shop_id,
                stock_quantity: { [Op.lte]: threshold }
            },
            order: [['stock_quantity', 'ASC']]
        });
        res.json(products);
    } catch (err) {
        console.error('getLowStock:', err);
        res.status(500).json({ error: 'Failed to fetch low stock' });
    }
};

module.exports = { getAdjustments, createAdjustment, getLowStock };
