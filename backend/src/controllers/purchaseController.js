const { PurchaseOrder, PurchaseOrderItem, Product, Supplier } = require('../models');
const { sequelize } = require('../config/database');

const listPurchases = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const orders = await PurchaseOrder.findAll({
            where: { shop_id },
            include: [
                { model: Supplier, attributes: ['id', 'name'] },
                {
                    model: PurchaseOrderItem,
                    as: 'items',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
                }
            ],
            order: [['order_date', 'DESC']]
        });
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch purchase orders' });
    }
};

const createPurchase = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const shop_id = req.user.shop_id;
        const { supplier_id, order_date, notes, items } = req.body;

        if (!items || items.length === 0) {
            await t.rollback();
            return res.status(400).json({ error: 'At least one item is required' });
        }

        // Calculate total
        const total_amount = items.reduce((sum, i) => sum + (parseFloat(i.unit_cost) * parseInt(i.quantity)), 0);

        const order = await PurchaseOrder.create({
            shop_id,
            supplier_id: supplier_id || null,
            order_date: order_date || new Date().toISOString().split('T')[0],
            total_amount,
            notes
        }, { transaction: t });

        for (const item of items) {
            await PurchaseOrderItem.create({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_cost: item.unit_cost
            }, { transaction: t });

            // Increment product stock
            await Product.increment('stock_quantity', {
                by: parseInt(item.quantity),
                where: { id: item.product_id, shop_id },
                transaction: t
            });
        }

        await t.commit();
        res.status(201).json(order);
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ error: 'Failed to create purchase order' });
    }
};

module.exports = { listPurchases, createPurchase };
