const { Invoice, InvoiceItem, Product, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /api/reports/end-of-day — end of day summary
const getEndOfDay = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const dateStr = req.query.date || new Date().toISOString().split('T')[0];
        const start = new Date(dateStr + 'T00:00:00.000Z');
        const end = new Date(dateStr + 'T23:59:59.999Z');

        const invoices = await Invoice.findAll({
            where: { shop_id, created_at: { [Op.between]: [start, end] } },
            include: [{ model: InvoiceItem, as: 'items' }]
        });

        const totalSales = invoices.reduce((s, inv) => s + parseFloat(inv.grand_total), 0);
        const totalDiscount = invoices.reduce((s, inv) => s + parseFloat(inv.discount || 0), 0);
        const totalTax = invoices.reduce((s, inv) => s + parseFloat(inv.tax_total || 0), 0);
        const cashSales = invoices.reduce((s, inv) => s + parseFloat(inv.paid_amount || 0), 0);
        const dueSales = invoices.reduce((s, inv) => s + parseFloat(inv.due_amount || 0), 0);
        const itemsSold = invoices.reduce((s, inv) => s + inv.items.reduce((is, item) => is + item.quantity, 0), 0);

        // Top products of the day
        const productMap = {};
        invoices.forEach(inv => {
            inv.items.forEach(item => {
                if (!productMap[item.product_id]) productMap[item.product_id] = { qty: 0, revenue: 0, name: item.product_id };
                productMap[item.product_id].qty += item.quantity;
                productMap[item.product_id].revenue += parseFloat(item.line_total);
            });
        });

        // Enrich product names
        const productIds = Object.keys(productMap);
        if (productIds.length) {
            const products = await Product.findAll({ where: { id: productIds }, attributes: ['id', 'name'] });
            products.forEach(p => { if (productMap[p.id]) productMap[p.id].name = p.name; });
        }

        const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        res.json({
            date: dateStr,
            invoiceCount: invoices.length,
            totalSales: totalSales.toFixed(2),
            totalDiscount: totalDiscount.toFixed(2),
            totalTax: totalTax.toFixed(2),
            cashCollected: cashSales.toFixed(2),
            outstanding: dueSales.toFixed(2),
            itemsSold,
            topProducts
        });
    } catch (err) {
        console.error('getEndOfDay:', err);
        res.status(500).json({ error: 'Failed to generate end-of-day report' });
    }
};

module.exports = { getEndOfDay };
