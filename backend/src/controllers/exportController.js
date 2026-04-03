const { Invoice, InvoiceItem, Product, Shop } = require('../../../database/models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');

/**
 * Helper to generate CSV string from array of objects
 */
const jsonToCSV = (data) => {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj =>
        Object.values(obj).map(val =>
            typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
        ).join(',')
    ).join('\n');
    return `${headers}\n${rows}`;
};

const exportSalesCSV = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { startDate, endDate } = req.query;

        const where = { shop_id };
        if (startDate && endDate) {
            where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        const invoices = await Invoice.findAll({
            where,
            include: [{ model: InvoiceItem, as: 'items', include: [{ model: Product }] }],
            order: [['created_at', 'DESC']]
        });

        const flatData = invoices.flatMap(inv =>
            inv.items.map(item => ({
                InvoiceNumber: inv.invoice_number,
                Date: inv.created_at.toISOString().split('T')[0],
                CustomerName: inv.customer_name || 'Walking Customer',
                ProductName: item.Product ? item.Product.name : 'Unknown Product',
                Quantity: item.quantity,
                UnitPrice: item.unit_price,
                Total: item.total_price,
                PaymentStatus: inv.status,
                TotalInvoiceAmount: inv.grand_total
            }))
        );

        const csv = jsonToCSV(flatData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=sales_report_${new Date().toISOString().split('T')[0]}.csv`);
        res.status(200).send(csv);

    } catch (error) {
        console.error('Export CSV Error:', error);
        res.status(500).json({ error: 'Failed to export CSV' });
    }
};

const exportSalesPDF = async (req, res) => {
    try {
        const shop_id = req.user.shop_id;
        const { startDate, endDate } = req.query;

        const shop = await Shop.findByPk(shop_id);
        const where = { shop_id };
        if (startDate && endDate) {
            where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
        }

        const invoices = await Invoice.findAll({
            where,
            order: [['created_at', 'DESC']]
        });

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=sales_report_${new Date().toISOString().split('T')[0]}.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(20).text(shop.name, { align: 'center' });
        doc.fontSize(10).text('Sales Report', { align: 'center' }).moveDown();
        if (startDate && endDate) {
            doc.text(`Period: ${startDate} to ${endDate}`, { align: 'center' }).moveDown();
        }

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Table Header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Inv #', 50, tableTop);
        doc.text('Date', 120, tableTop);
        doc.text('Customer', 200, tableTop);
        doc.text('Status', 350, tableTop);
        doc.text('Amount', 450, tableTop, { align: 'right' });
        doc.font('Helvetica');
        doc.moveDown();

        // Table Rows
        invoices.forEach(inv => {
            const y = doc.y;
            if (y > 700) doc.addPage();
            doc.text(inv.invoice_number, 50, doc.y);
            doc.text(inv.created_at.toISOString().split('T')[0], 120, doc.y);
            doc.text(inv.customer_name || 'Walking Customer', 200, doc.y, { width: 140 });
            doc.text(inv.status, 350, doc.y);
            doc.text(`${shop.currency} ${inv.grand_total}`, 450, doc.y, { align: 'right' });
            doc.moveDown();
        });

        // Footer
        const totalSales = invoices.reduce((sum, inv) => sum + Number(inv.grand_total), 0);
        doc.moveDown().font('Helvetica-Bold');
        doc.text(`Total Sales: ${shop.currency} ${totalSales.toFixed(2)}`, { align: 'right' });

        doc.end();

    } catch (error) {
        console.error('Export PDF Error:', error);
        res.status(500).json({ error: 'Failed to export PDF' });
    }
};

module.exports = { exportSalesCSV, exportSalesPDF };
