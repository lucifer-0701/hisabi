const { sequelize } = require('../../../database/database');
const { Shop, Product, Invoice, InvoiceItem, Expense, Category } = require('../../../database/models');
const { Op } = require('sequelize');

const getDashboardStats = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;

        const totalRevenue = await Invoice.sum('grand_total', {
            where: { shop_id, status: { [Op.in]: ['paid', 'partial'] } }
        });

        const lowStockCount = await Product.count({
            where: { shop_id, stock_quantity: { [Op.lte]: 2 } }
        });

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todaySales = await Invoice.sum('grand_total', {
            where: { shop_id, status: { [Op.in]: ['paid', 'partial'] }, date: { [Op.gte]: startOfDay } }
        });

        res.json({ totalRevenue: totalRevenue || 0, lowStockCount: lowStockCount || 0, todaySales: todaySales || 0 });
    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

const getFullDashboardStats = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayRevenue = await Invoice.sum('grand_total', {
            where: { shop_id, status: { [Op.in]: ['paid', 'partial'] }, date: { [Op.gte]: startOfDay } }
        });

        const totalInvoices = await Invoice.count({ where: { shop_id } });

        const lowStockCount = await Product.count({ where: { shop_id, stock_quantity: { [Op.lte]: 5 } } });

        const todayExpenses = await Expense.sum('amount', {
            where: { shop_id, expense_date: new Date().toISOString().split('T')[0] }
        });

        const totalProducts = await Product.count({ where: { shop_id } });

        const invoices = await Invoice.findAll({
            where: { shop_id, status: { [Op.in]: ['paid', 'partial'] } },
            include: [{ model: InvoiceItem, as: 'items', include: [Product] }]
        });

        const productMap = {};
        invoices.forEach(inv => {
            (inv.items || []).forEach(item => {
                const id = item.product_id;
                if (!productMap[id]) productMap[id] = { name: item.Product?.name || 'Unknown', revenue: 0, quantity: 0 };
                productMap[id].revenue += parseFloat(item.line_total || 0);
                productMap[id].quantity += item.quantity;
            });
        });


        const topProducts = Object.values(productMap)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        res.json({
            todayRevenue: todayRevenue || 0,
            totalInvoices: totalInvoices || 0,
            lowStockCount: lowStockCount || 0,
            todayExpenses: todayExpenses || 0,
            totalProducts: totalProducts || 0,
            topProducts
        });
    } catch (error) {
        console.error('Full Stats Error [shop_id:' + req.user?.shop_id + ']:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats', details: error.message });
    }
};

const getDailySales = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { date, startDate, endDate } = req.query;

        let dateFilter = {};
        let labelDate = new Date();

        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter = { [Op.between]: [start, end] };
            labelDate = start;
        } else if (date) {
            const targetDate = new Date(date);
            const start = new Date(targetDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(targetDate);
            end.setHours(23, 59, 59, 999);
            dateFilter = { [Op.between]: [start, end] };
            labelDate = targetDate;
        } else {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setHours(23, 59, 59, 999);
            dateFilter = { [Op.between]: [start, end] };
        }

        const invoices = await Invoice.findAll({
            where: { shop_id, status: { [Op.in]: ['paid', 'partial'] }, date: dateFilter },
            include: [{ model: InvoiceItem, as: 'items', include: [Product] }]
        });

        const productSales = {};
        let total = 0;

        invoices.forEach(invoice => {
            total += parseFloat(invoice.grand_total);
            (invoice.items || []).forEach(item => {
                const id = item.product_id;
                if (!productSales[id]) {
                    productSales[id] = { name: item.Product?.name || 'Unknown', quantity: 0, revenue: 0 };
                }
                productSales[id].quantity += item.quantity;
                productSales[id].revenue += parseFloat(item.line_total);
            });
        });


        res.json({ date: labelDate, totalSales: total, breakdown: Object.values(productSales) });

    } catch (error) {
        console.error('Daily Sales Error:', error);
        res.status(500).json({ error: 'Failed to fetch daily sales' });
    }
};

const getProfitAnalysis = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter = { [Op.between]: [start, end] };
        } else {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            dateFilter = { [Op.between]: [start, end] };
        }

        const invoices = await Invoice.findAll({
            where: { shop_id, status: { [Op.in]: ['paid', 'partial'] }, date: dateFilter },
            include: [{ model: InvoiceItem, as: 'items', include: [Product] }]
        });

        let totalRevenue = 0;
        let totalCost = 0;

        invoices.forEach(invoice => {
            const netInvoiceRevenue = parseFloat(invoice.subtotal) - parseFloat(invoice.discount);
            totalRevenue += netInvoiceRevenue;
            (invoice.items || []).forEach(item => {
                totalCost += parseFloat(item.cost_price || 0) * item.quantity;
            });
        });


        const totalProfit = totalRevenue - totalCost;
        const margin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        // Calculate total due for this period
        const totalDue = await Invoice.sum('due_amount', {
            where: { shop_id, status: { [Op.in]: ['paid', 'partial'] }, date: dateFilter }
        });

        res.json({ totalRevenue, totalCost, totalProfit, margin, totalDue: totalDue || 0, invoiceCount: invoices.length });
    } catch (error) {
        console.error('Profit Analysis Error:', error);
        res.status(500).json({ error: 'Failed to fetch profit analysis' });
    }
};

const getTrendData = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { startDate, endDate } = req.query;

        let start = new Date();
        start.setDate(start.getDate() - 30);
        let end = new Date();

        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        }

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        // Get daily revenue
        const invoices = await Invoice.findAll({
            where: {
                shop_id,
                status: { [Op.in]: ['paid', 'partial'] },
                date: { [Op.between]: [start, end] }
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('date')), 'day'],
                [sequelize.fn('SUM', sequelize.col('grand_total')), 'revenue']
            ],
            group: [sequelize.fn('DATE', sequelize.col('date'))],
            order: [[sequelize.fn('DATE', sequelize.col('date')), 'ASC']]
        });

        // Get daily expenses
        const expenses = await Expense.findAll({
            where: {
                shop_id,
                expense_date: { [Op.between]: [start.toISOString().split('T')[0], end.toISOString().split('T')[0]] }
            },
            attributes: [
                'expense_date',
                [sequelize.fn('SUM', sequelize.col('amount')), 'amount']
            ],
            group: ['expense_date'],
            order: [['expense_date', 'ASC']]
        });

        // Merge into a single trend array
        const trendMap = {};
        const curr = new Date(start);
        while (curr <= end) {
            const dateStr = curr.toISOString().split('T')[0];
            trendMap[dateStr] = { date: dateStr, revenue: 0, expense: 0 };
            curr.setDate(curr.getDate() + 1);
        }

        invoices.forEach(inv => {
            const day = inv.get('day');
            if (trendMap[day]) {
                trendMap[day].revenue = parseFloat(inv.get('revenue') || 0);
            }
        });

        expenses.forEach(exp => {
            const day = exp.expense_date;
            if (trendMap[day]) {
                trendMap[day].expense = parseFloat(exp.get('amount') || 0);
            }
        });

        res.json(Object.values(trendMap));
    } catch (error) {
        console.error('Trend Data Error:', error);
        res.status(500).json({ error: 'Failed to fetch trend data' });
    }
};

const getAdvancedAnalytics = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { startDate, endDate } = req.query;

        let start, end;
        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            end = new Date();
            start = new Date();
            start.setDate(start.getDate() - 30);
        }
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const dateFilter = { [Op.between]: [start, end] };

        // 1. Sales by Category — fetch items with joins, aggregate in JS
        const categoryItems = await InvoiceItem.findAll({
            include: [
                {
                    model: Invoice,
                    where: { shop_id, status: { [Op.in]: ['paid', 'partial'] }, date: dateFilter },
                    attributes: []
                },
                {
                    model: Product,
                    include: [{ model: Category }]
                }
            ]
        });

        const categoryMap = {};
        categoryItems.forEach(item => {
            const catName = item.Product?.Category?.name || 'Uncategorized';
            if (!categoryMap[catName]) categoryMap[catName] = { name: catName, revenue: 0, quantity: 0 };
            categoryMap[catName].revenue += parseFloat(item.line_total || 0);
            categoryMap[catName].quantity += item.quantity;
        });

        // 2. Sales by Hour
        const salesByHour = await Invoice.findAll({
            where: { shop_id, status: { [Op.in]: ['paid', 'partial'] }, date: dateFilter },
            attributes: [
                [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM "date"')), 'hour'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('grand_total')), 'revenue']
            ],
            group: [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM "date"'))],
            order: [[sequelize.literal('hour'), 'ASC']],
            raw: true
        });

        // 3. Top Customers
        const topCustomers = await Invoice.findAll({
            where: { shop_id, status: { [Op.in]: ['paid', 'partial'] }, date: dateFilter, customer_name: { [Op.ne]: null } },
            attributes: [
                'customer_name',
                [sequelize.fn('COUNT', sequelize.col('id')), 'visit_count'],
                [sequelize.fn('SUM', sequelize.col('grand_total')), 'total_spent']
            ],
            group: ['customer_name'],
            order: [[sequelize.literal('total_spent'), 'DESC']],
            limit: 10,
            raw: true
        });

        res.json({
            salesByCategory: Object.values(categoryMap),
            salesByHour: salesByHour.map(h => ({
                hour: parseInt(h.hour),
                count: parseInt(h.count),
                revenue: parseFloat(h.revenue || 0)
            })),
            topCustomers: topCustomers.map(cust => ({
                name: cust.customer_name,
                visits: parseInt(cust.visit_count),
                spent: parseFloat(cust.total_spent || 0)
            }))
        });

    } catch (error) {
        console.error('Advanced Analytics Error:', error);
        res.status(500).json({ error: 'Failed to fetch advanced analytics' });
    }
};

module.exports = {
    getDashboardStats,
    getFullDashboardStats,
    getDailySales,
    getProfitAnalysis,
    getTrendData,
    getAdvancedAnalytics
};
