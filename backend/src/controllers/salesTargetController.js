const { SalesTarget, Invoice, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /api/targets — get all targets + current month progress
const getTargets = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const targets = await SalesTarget.findAll({
            where: { shop_id },
            order: [['year', 'DESC'], ['month', 'DESC']]
        });

        // Calculate actual revenue for current month
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);

        const result = await Invoice.findOne({
            where: { shop_id, status: 'paid', created_at: { [Op.between]: [startOfMonth, endOfMonth] } },
            attributes: [[sequelize.fn('SUM', sequelize.col('grand_total')), 'total']]
        });

        const currentRevenue = parseFloat(result?.dataValues?.total || 0);
        const currentTarget = targets.find(t => t.month === month && t.year === year);

        res.json({
            targets,
            currentMonth: { month, year, revenue: currentRevenue, target: currentTarget?.target_amount || null }
        });
    } catch (err) {
        console.error('getTargets:', err);
        res.status(500).json({ error: 'Failed to fetch targets' });
    }
};

// POST /api/targets — set target for a month
const setTarget = async (req, res) => {
    try {
        const { month, year, target_amount } = req.body;
        if (!month || !year || !target_amount) return res.status(400).json({ error: 'month, year, target_amount required' });

        const [target, created] = await SalesTarget.findOrCreate({
            where: { shop_id: req.user.shop_id, month, year },
            defaults: { target_amount }
        });
        if (!created) {
            target.target_amount = target_amount;
            await target.save();
        }
        res.json(target);
    } catch (err) {
        console.error('setTarget:', err);
        res.status(500).json({ error: 'Failed to set target' });
    }
};

module.exports = { getTargets, setTarget };
