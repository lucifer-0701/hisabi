const { DiscountCode } = require('../../../database/models');
const { Op } = require('sequelize');

// GET /api/discount-codes
const getCodes = async (req, res) => {
    try {
        const codes = await DiscountCode.findAll({
            where: { shop_id: req.user.shop_id },
            order: [['created_at', 'DESC']]
        });
        res.json(codes);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch codes' });
    }
};

// POST /api/discount-codes
const createCode = async (req, res) => {
    try {
        const { code, type, value, min_order_amount, max_uses, expires_at } = req.body;
        if (!code || !type || !value) return res.status(400).json({ error: 'code, type, and value are required' });

        const existing = await DiscountCode.findOne({ where: { shop_id: req.user.shop_id, code } });
        if (existing) return res.status(400).json({ error: 'Code already exists' });

        const dc = await DiscountCode.create({
            shop_id: req.user.shop_id, code: code.toUpperCase(), type, value,
            min_order_amount: min_order_amount || 0,
            max_uses: max_uses || null,
            expires_at: expires_at || null
        });
        res.status(201).json(dc);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create code' });
    }
};

// PATCH /api/discount-codes/:id/toggle
const toggleCode = async (req, res) => {
    try {
        const dc = await DiscountCode.findOne({ where: { id: req.params.id, shop_id: req.user.shop_id } });
        if (!dc) return res.status(404).json({ error: 'Code not found' });
        dc.active = !dc.active;
        await dc.save();
        res.json(dc);
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle code' });
    }
};

// DELETE /api/discount-codes/:id
const deleteCode = async (req, res) => {
    try {
        await DiscountCode.destroy({ where: { id: req.params.id, shop_id: req.user.shop_id } });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete code' });
    }
};

// POST /api/discount-codes/validate — validate code at POS
const validateCode = async (req, res) => {
    try {
        const { code, order_total } = req.body;
        const result = await DiscountCode.validate(code, req.user.shop_id, parseFloat(order_total || 0));
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = { getCodes, createCode, toggleCode, deleteCode, validateCode };
