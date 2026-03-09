const Joi = require('joi');
const { sequelize } = require('../../../database/database');
const { Shop, Product, Invoice, InvoiceItem, BundleItem } = require('../../../database/models');

const invoiceSchema = Joi.object({
    customer_name: Joi.string().allow('', null),
    customer_phone: Joi.string().allow('', null),
    customer_email: Joi.string().allow('', null).email(),
    discount: Joi.number().min(0).default(0),
    paid_amount: Joi.number().min(0).required(),
    items: Joi.array().items(
        Joi.object({
            product_id: Joi.string().uuid().required(),
            quantity: Joi.number().integer().min(1).required()
        })
    ).min(1).required()
});

const createInvoice = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const shop_id = req.user.shop_id;
        const user_id = req.user.id;
        const { items, customer_name, customer_phone, customer_email, discount, paid_amount } = req.body;

        // Fetch Shop to get VAT settings
        const shop = await Shop.findByPk(shop_id);
        if (!shop) {
            await t.rollback();
            return res.status(404).json({ error: 'Shop not found' });
        }

        let subtotal = 0;
        let tax_total = 0;
        const invoiceItemsData = [];

        // Process items
        for (const item of items) {
            const product = await Product.findOne({
                where: { id: item.product_id, shop_id },
                include: [{ model: BundleItem, as: 'bundleItems' }] // Include bundle items if any
            });

            if (!product) {
                await t.rollback();
                return res.status(404).json({ error: `Product not found: ${item.product_id}` });
            }

            // Stock Check & Deduction Logic
            if (product.is_bundle) {
                // Check stock for all components
                for (const bundleItem of product.bundleItems) {
                    const component = await Product.findByPk(bundleItem.product_id);
                    const requiredQty = bundleItem.quantity * item.quantity;

                    if (component.stock_quantity < requiredQty) {
                        await t.rollback();
                        return res.status(400).json({ error: `Insufficient stock for bundle component: ${component.name}` });
                    }

                    // Deduct component stock
                    await component.update({
                        stock_quantity: component.stock_quantity - requiredQty
                    }, { transaction: t });
                }
            } else {
                // Normal Product Stock Check
                if (product.stock_quantity < item.quantity) {
                    await t.rollback();
                    return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
                }

                // Deduct stock
                await product.update({
                    stock_quantity: product.stock_quantity - item.quantity
                }, { transaction: t });
            }

            const unit_price = parseFloat(product.selling_price);
            const line_total = unit_price * item.quantity;
            let line_tax = 0;

            if (shop.vat_enabled) {
                line_tax = line_total * 0.05;
            }

            subtotal += line_total;
            tax_total += line_tax;

            invoiceItemsData.push({
                product_id: product.id,
                quantity: item.quantity,
                unit_price: unit_price,
                cost_price: product.cost_price, // Store cost price at time of sale
                mrp: product.mrp, // Store MRP
                line_total: line_total,
                tax_amount: line_tax
            });
        }

        const total_before_discount = subtotal + tax_total;
        const grand_total = Math.max(0, total_before_discount - (discount || 0));
        const due_amount = Math.max(0, grand_total - (paid_amount || 0));

        let status = 'paid';
        if (due_amount > 0) {
            status = 'partial';
        }

        // Get next invoice number for this shop
        const lastInvoice = await Invoice.findOne({
            where: { shop_id },
            order: [['invoice_number', 'DESC']]
        });
        const nextInvoiceNumber = lastInvoice ? lastInvoice.invoice_number + 1 : 1;

        // Create Invoice
        const invoice = await Invoice.create({
            shop_id,
            user_id,
            invoice_number: nextInvoiceNumber,
            subtotal: subtotal,
            tax_total: tax_total,
            grand_total: grand_total,
            discount: discount || 0,
            paid_amount: paid_amount || 0,
            due_amount: due_amount,
            status: status,
            customer_name: customer_name || 'Walk-in Customer',
            customer_phone: customer_phone,
            customer_email: customer_email
        }, { transaction: t });

        // Create Invoice Items linked to Invoice
        // We Map data to include invoice_id
        const itemsToCreate = invoiceItemsData.map(data => ({
            ...data,
            invoice_id: invoice.id
        }));

        await InvoiceItem.bulkCreate(itemsToCreate, { transaction: t });

        await t.commit();

        // Fetch complete invoice with items for response
        const completeInvoice = await Invoice.findOne({
            where: { id: invoice.id },
            include: [{ model: InvoiceItem, as: 'items', include: [Product] }]
        });


        res.status(201).json(completeInvoice);

    } catch (error) {
        await t.rollback();
        console.error('Create Invoice Error:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
};

const listInvoices = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        // Fetch Shop to check plan
        const shop = await Shop.findByPk(shop_id);
        const { Op } = require('sequelize');

        let where = { shop_id };

        // Phase 7: History Retention (Premium gets unlimited, others 6 months)
        if (shop.plan !== 'premium') {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            where.created_at = { [Op.gte]: sixMonthsAgo };
        }

        const invoices = await Invoice.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            include: [
                { model: InvoiceItem, as: 'items' }
            ]

        });

        res.json({
            data: invoices.rows,
            meta: {
                total: invoices.count,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('List Invoices Error:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};

const getInvoice = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { id } = req.params;

        const invoice = await Invoice.findOne({
            where: { id, shop_id },
            include: [
                {
                    model: InvoiceItem,
                    as: 'items',
                    include: [{ model: Product, attributes: ['name', 'barcode'] }]
                }
            ]

        });

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json(invoice);
    } catch (error) {
        console.error('Get Invoice Error:', error);
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
};

const { generateInvoicePDF } = require('../services/pdfService');

const downloadInvoicePDF = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { id } = req.params;

        const invoice = await Invoice.findOne({
            where: { id, shop_id },
            include: [
                {
                    model: InvoiceItem,
                    as: 'items',
                    include: [{ model: Product, attributes: ['name'] }]
                }
            ]

        });

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const shop = await Shop.findByPk(shop_id);

        const pdfBuffer = await generateInvoicePDF(invoice, shop);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${invoice.invoice_number}.pdf"`,
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('Download PDF Error:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

const deleteInvoice = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const shop_id = req.user.shop_id;
        const { id } = req.params;

        const invoice = await Invoice.findOne({
            where: { id, shop_id },
            include: [{ model: InvoiceItem, as: 'items' }]
        });


        if (!invoice) {
            await t.rollback();
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Delete Invoice Items (cascading might handle this, but explicit is safer)
        await InvoiceItem.destroy({ where: { invoice_id: id }, transaction: t });

        // Delete Invoice
        await invoice.destroy({ transaction: t });

        await t.commit();
        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        await t.rollback();
        console.error('Delete Invoice Error:', error);
        res.status(500).json({ error: 'Failed to delete invoice' });
    }
};

const updatePayment = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { id } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }

        const invoice = await Invoice.findOne({
            where: { id, shop_id }
        });

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        if (parseFloat(invoice.due_amount) <= 0) {
            return res.status(400).json({ error: 'Invoice is already fully paid' });
        }

        const newPaidAmount = parseFloat(invoice.paid_amount) + parseFloat(amount);
        const newDueAmount = Math.max(0, parseFloat(invoice.grand_total) - newPaidAmount);
        const newStatus = newDueAmount <= 0 ? 'paid' : 'partial';

        await invoice.update({
            paid_amount: newPaidAmount,
            due_amount: newDueAmount,
            status: newStatus
        });

        res.json(invoice);
    } catch (error) {
        console.error('Update Payment Error:', error);
        res.status(500).json({ error: 'Failed to update payment' });
    }
};

module.exports = {
    createInvoice,
    listInvoices,
    getInvoice,
    downloadInvoicePDF,
    deleteInvoice,
    updatePayment,
    invoiceSchema
};
