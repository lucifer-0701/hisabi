const { DuePayment, Invoice, Shop, Customer } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

const getPendingDues = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { search, status } = req.query;

        let where = {
            shop_id,
            due_amount: { [Op.gt]: 0 }
        };

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where[Op.or] = [
                { customer_name: { [Op.iLike]: `%${search}%` } },
                { invoice_number: sequelize.where(sequelize.cast(sequelize.col('invoice_number'), 'text'), { [Op.iLike]: `%${search}%` }) }
            ];
        }

        const invoices = await Invoice.findAll({
            where,
            order: [['date', 'DESC']]
        });

        res.json(invoices);
    } catch (error) {
        console.error('Get Pending Dues Error:', error);
        res.status(500).json({ error: 'Failed to fetch pending dues' });
    }
};

const collectPayment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const shop_id = req.user.shop_id;
        const { invoice_id, amount, payment_method, payment_date, notes } = req.body;

        if (!amount || amount <= 0) {
            await t.rollback();
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        const invoice = await Invoice.findOne({
            where: { id: invoice_id, shop_id },
            transaction: t
        });

        if (!invoice) {
            await t.rollback();
            return res.status(404).json({ error: 'Invoice not found' });
        }

        if (parseFloat(amount) > parseFloat(invoice.due_amount)) {
            await t.rollback();
            return res.status(400).json({ error: 'Payment exceeds due amount' });
        }

        // Generate sequential DUE-XXXX number
        const lastPayment = await DuePayment.findOne({
            where: { shop_id },
            order: [['created_at', 'DESC']],
            transaction: t
        });

        let nextNumber = 1001;
        if (lastPayment && lastPayment.due_invoice_number.startsWith('DUE-')) {
            const lastNum = parseInt(lastPayment.due_invoice_number.split('-')[1]);
            if (!isNaN(lastNum)) nextNumber = lastNum + 1;
        }

        const due_invoice_number = `DUE-${nextNumber}`;

        const newPaidAmount = parseFloat(invoice.paid_amount) + parseFloat(amount);
        const newDueAmount = parseFloat(invoice.due_amount) - parseFloat(amount);
        const newStatus = newDueAmount <= 0 ? 'paid' : 'partial';

        // Create DuePayment record
        const duePayment = await DuePayment.create({
            shop_id,
            invoice_id,
            due_invoice_number,
            amount,
            payment_method,
            payment_date: payment_date || new Date(),
            remaining_balance: newDueAmount,
            notes
        }, { transaction: t });

        // Update Original Invoice
        await invoice.update({
            paid_amount: newPaidAmount,
            due_amount: newDueAmount,
            status: newStatus
        }, { transaction: t });

        await t.commit();
        res.status(201).json(duePayment);
    } catch (error) {
        await t.rollback();
        console.error('Collect Payment Error:', error);
        res.status(500).json({ error: 'Failed to record due payment' });
    }
};

const getDueStats = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;

        const totalPending = await Invoice.sum('due_amount', {
            where: { shop_id, due_amount: { [Op.gt]: 0 } }
        });

        const totalCollected = await DuePayment.sum('amount', {
            where: { shop_id }
        });

        // Today's Collection
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const dueToday = await DuePayment.sum('amount', {
            where: { shop_id, payment_date: { [Op.gte]: startOfToday } }
        });

        // This Week's Collection (Last 7 days)
        const startOfLast7Days = new Date();
        startOfLast7Days.setDate(startOfLast7Days.getDate() - 7);
        const dueWeek = await DuePayment.sum('amount', {
            where: { shop_id, payment_date: { [Op.gte]: startOfLast7Days } }
        });

        // Overdue (7+ days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const overdueAmount = await Invoice.sum('due_amount', {
            where: {
                shop_id,
                due_amount: { [Op.gt]: 0 },
                date: { [Op.lt]: sevenDaysAgo }
            }
        });

        res.json({
            totalPending: totalPending || 0,
            totalCollected: totalCollected || 0,
            dueToday: dueToday || 0,
            dueWeek: dueWeek || 0,
            overdueAmount: overdueAmount || 0
        });
    } catch (error) {
        console.error('Get Due Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch due collection stats' });
    }
};

const getDueHistoryEntries = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { startDate, endDate } = req.query;

        let dateFilter = { shop_id };
        if (startDate && endDate) {
            dateFilter.payment_date = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        const history = await DuePayment.findAll({
            where: dateFilter,
            include: [{ model: Invoice, attributes: ['invoice_number', 'customer_name'] }],
            order: [['payment_date', 'DESC']]
        });

        res.json(history);
    } catch (error) {
        console.error('Get Due History Error:', error);
        res.status(500).json({ error: 'Failed to fetch payment history' });
    }
};

const { generateDueReceiptPDF } = require('../services/pdfService');

const downloadDueReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const shop_id = req.user.shop_id;

        const payment = await DuePayment.findOne({
            where: { id, shop_id },
            include: [{ model: Invoice }]
        });

        if (!payment) return res.status(404).json({ error: 'Receipt not found' });

        const shop = await Shop.findByPk(shop_id);
        const pdfBuffer = await generateDueReceiptPDF(payment, payment.Invoice, shop);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=receipt-${payment.due_invoice_number}.pdf`,
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Download Receipt Error:', error);
        res.status(500).json({ error: 'Failed to generate receipt' });
    }
};

module.exports = {
    getPendingDues,
    collectPayment,
    getDueStats,
    getDueHistoryEntries,
    downloadDueReceipt
};
