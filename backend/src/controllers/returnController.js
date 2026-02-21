const { Return, Product } = require('../models');
const { sequelize } = require('../config/database');

const listReturns = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const returns = await Return.findAll({
            where: { shop_id },
            include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
            order: [['return_date', 'DESC']]
        });
        res.json(returns);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch returns' });
    }
};

const createReturn = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const shop_id = req.user.shop_id;
        const { product_id, quantity, reason, refund_amount, invoice_ref, return_date } = req.body;

        if (!product_id || !quantity) {
            await t.rollback();
            return res.status(400).json({ error: 'Product and quantity are required' });
        }

        const ret = await Return.create({
            shop_id,
            product_id,
            quantity: parseInt(quantity),
            reason,
            refund_amount: parseFloat(refund_amount) || 0,
            invoice_ref,
            return_date: return_date || new Date().toISOString().split('T')[0]
        }, { transaction: t });

        // Restock product
        await Product.increment('stock_quantity', {
            by: parseInt(quantity),
            where: { id: product_id, shop_id },
            transaction: t
        });

        await t.commit();
        res.status(201).json(ret);
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ error: 'Failed to create return' });
    }
};

module.exports = { listReturns, createReturn };
