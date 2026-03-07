const { Expense } = require('../../../database/models');
const { Op } = require('sequelize');

const listExpenses = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { startDate, endDate } = req.query;
        const where = { shop_id };
        if (startDate && endDate) {
            where.expense_date = { [Op.between]: [startDate, endDate] };
        }
        const expenses = await Expense.findAll({ where, order: [['expense_date', 'DESC']] });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
};

const createExpense = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { title, amount, category, expense_date, notes } = req.body;
        if (!title || !amount || !expense_date) return res.status(400).json({ error: 'Title, amount, and date are required' });
        const expense = await Expense.create({ shop_id, title, amount, category: category || 'Other', expense_date, notes });
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create expense' });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const shop_id = req.user.shop_id;
        const expense = await Expense.findOne({ where: { id, shop_id } });
        if (!expense) return res.status(404).json({ error: 'Expense not found' });
        await expense.destroy();
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete expense' });
    }
};

module.exports = { listExpenses, createExpense, deleteExpense };
