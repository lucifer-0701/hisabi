const puppeteer = require('puppeteer');

const generateHTML = (invoice, shop) => {
    const isUAE = shop.vat_enabled;
    const currency = shop.currency;
    const date = new Date(invoice.date).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const itemsRows = (invoice.items || []).map((item, index) => `
    <tr class="item-row">
        <td class="text-center">${index + 1}</td>
        <td class="text-left">
            <div class="product-name">${item.Product.name}</div>
            ${item.Product.description ? `<div class="product-desc">${item.Product.description}</div>` : ''}
        </td>
        <td class="text-center">${item.quantity}</td>
        <td class="text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
        <td class="text-right">${item.mrp && parseFloat(item.mrp) > 0 ? parseFloat(item.mrp).toFixed(2) : '—'}</td>
        <td class="text-right">${(item.quantity * item.unit_price).toFixed(2)}</td>
    </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            :root {
                --primary: #4f46e5;
                --text-main: #1e293b;
                --text-muted: #64748b;
                --bg-light: #f8fafc;
                --border: #e2e8f0;
            }
            
            body {
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                margin: 0;
                padding: 40px;
                color: var(--text-main);
                line-height: 1.5;
                background: white;
            }

            .invoice-container {
                max-width: 800px;
                margin: auto;
            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 40px;
                border-bottom: 2px solid var(--primary);
                padding-bottom: 20px;
            }

            .shop-info h1 {
                margin: 0;
                color: var(--primary);
                font-size: 28px;
                font-weight: 800;
                letter-spacing: -0.025em;
            }

            .shop-details {
                font-size: 13px;
                color: var(--text-muted);
                margin-top: 8px;
            }

            .invoice-meta {
                text-align: right;
            }

            .invoice-meta h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 700;
                color: var(--text-main);
                text-transform: uppercase;
            }

            .meta-item {
                font-size: 14px;
                margin-top: 5px;
            }

            .meta-label {
                color: var(--text-muted);
                font-weight: 600;
            }

            .billing-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
            }

            .bill-to h3 {
                margin: 0 0 10px 0;
                font-size: 14px;
                text-transform: uppercase;
                color: var(--text-muted);
                letter-spacing: 0.05em;
            }

            .customer-name {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 5px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }

            th {
                background: var(--bg-light);
                color: var(--text-muted);
                font-weight: 600;
                text-transform: uppercase;
                font-size: 12px;
                padding: 12px 15px;
                text-align: left;
                border-bottom: 2px solid var(--border);
            }

            .item-row td {
                padding: 15px;
                border-bottom: 1px solid var(--border);
                font-size: 14px;
            }

            .item-row:nth-child(even) {
                background-color: #fafafa;
            }

            .product-name {
                font-weight: 600;
            }

            .product-desc {
                font-size: 12px;
                color: var(--text-muted);
                margin-top: 2px;
            }

            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }

            .summary-section {
                display: flex;
                justify-content: flex-end;
            }

            .totals-table {
                width: 300px;
            }

            .totals-table tr td {
                padding: 8px 0;
                font-size: 14px;
            }

            .total-row {
                font-weight: 700;
                font-size: 18px !important;
                color: var(--primary);
                border-top: 2px solid var(--primary);
            }

            .payment-info {
                margin-top: 20px;
                padding: 15px;
                background: var(--bg-light);
                border-radius: 8px;
                font-size: 13px;
            }

            .footer {
                margin-top: 60px;
                text-align: center;
                color: var(--text-muted);
                font-size: 12px;
                border-top: 1px solid var(--border);
                padding-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <div class="header">
                <div class="shop-info">
                    <h1>${shop.name}</h1>
                    <div class="shop-details">
                        <div>${shop.address || ''}</div>
                        <div>${shop.phone || ''} ${shop.email ? '&nbsp; | &nbsp;' + shop.email : ''}</div>
                        ${isUAE && shop.trn ? `<div style="margin-top: 5px;"><strong>TRN: ${shop.trn}</strong></div>` : ''}
                    </div>
                </div>
                <div class="invoice-meta">
                    <h2>Invoice</h2>
                    <div class="meta-item">
                        <span class="meta-label">ID:</span> #${invoice.id.toString().padStart(6, '0')}
                    </div>
                    <div class="meta-item">
                        <span class="meta-label">Date:</span> ${date}
                    </div>
                </div>
            </div>

            <div class="billing-row">
                <div class="bill-to">
                    <h3>Bill To</h3>
                    <div class="customer-name">${invoice.customer_name || 'Walk-in Customer'}</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="width: 80px;" class="text-center">#</th>
                        <th>Item Description</th>
                        <th style="width: 100px;" class="text-center">Qty</th>
                        <th style="width: 120px;" class="text-right">Price</th>
                        <th style="width: 120px;" class="text-right">MRP</th>
                        <th style="width: 120px;" class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsRows}
                </tbody>
            </table>

            <div class="summary-section">
                <table class="totals-table">
                    <tr>
                        <td class="text-left meta-label">Subtotal</td>
                        <td class="text-right">${currency} ${parseFloat(invoice.subtotal).toFixed(2)}</td>
                    </tr>
                    ${isUAE ? `
                    <tr>
                        <td class="text-left meta-label">VAT (5%)</td>
                        <td class="text-right">${currency} ${parseFloat(invoice.tax_total).toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    ${parseFloat(invoice.discount) > 0 ? `
                    <tr>
                        <td class="text-left meta-label">Discount</td>
                        <td class="text-right">-${currency} ${parseFloat(invoice.discount).toFixed(2)}</td>
                    </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td class="text-left">Grand Total</td>
                        <td class="text-right">${currency} ${parseFloat(invoice.grand_total).toFixed(2)}</td>
                    </tr>
                </table>
            </div>

            <div class="payment-info">
                <div style="display: flex; justify-content: space-between;">
                    <span>Paid Amount:</span>
                    <span style="font-weight: 600;">${currency} ${parseFloat(invoice.paid_amount || 0).toFixed(2)}</span>
                </div>
                ${parseFloat(invoice.due_amount) > 0 ? `
                <div style="display: flex; justify-content: space-between; margin-top: 5px; color: #dc2626;">
                    <span>Balance Due:</span>
                    <span style="font-weight: 700;">${currency} ${parseFloat(invoice.due_amount).toFixed(2)}</span>
                </div>
                ` : ''}
            </div>

            <div class="footer">
                <p style="font-weight: 600; font-size: 14px; margin-bottom: 5px; color: var(--text-main);">Thank you for your business!</p>
                <p>If you have any questions about this invoice, please contact us.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const generateDueReceiptHTML = (payment, invoice, shop) => {
    const currency = shop.currency;
    const date = new Date(payment.payment_date).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            :root {
                --primary: #4f46e5;
                --text-main: #1e293b;
                --text-muted: #64748b;
                --bg-light: #f8fafc;
                --border: #e2e8f0;
            }
            body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 40px; color: var(--text-main); }
            .receipt-container { max-width: 600px; margin: auto; border: 1px solid var(--border); padding: 40px; border-radius: 12px; }
            .header { text-align: center; border-bottom: 2px solid var(--primary); padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: var(--primary); font-size: 24px; }
            .receipt-title { text-align: center; font-size: 18px; font-weight: 800; text-transform: uppercase; margin-bottom: 30px; letter-spacing: 0.1em; color: var(--text-muted); }
            .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-item label { display: block; font-[9px]; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; }
            .info-item span { font-size: 14px; font-weight: 600; }
            .payment-summary { background: var(--bg-light); padding: 25px; border-radius: 12px; margin-bottom: 30px; }
            .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            .summary-row.total { border-top: 1px solid var(--border); padding-top: 15px; margin-top: 15px; font-weight: 800; font-size: 18px; color: var(--primary); }
            .footer { text-align: center; font-size: 12px; color: var(--text-muted); margin-top: 40px; }
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                <h1>${shop.name}</h1>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 5px;">${shop.address || ''}</div>
            </div>
            
            <div class="receipt-title">Due Payment Receipt</div>
            
            <div class="info-grid">
                <div class="info-item">
                    <label>Receipt No</label>
                    <span>${payment.due_invoice_number}</span>
                </div>
                <div class="info-item">
                    <label>Date</label>
                    <span>${date}</span>
                </div>
                <div class="info-item">
                    <label>Customer</label>
                    <span>${invoice.customer_name || 'Walk-in Customer'}</span>
                </div>
                <div class="info-item">
                    <label>Original Invoice</label>
                    <span>#${invoice.invoice_number}</span>
                </div>
            </div>

            <div class="payment-summary">
                <div class="summary-row">
                    <span>Original Grand Total:</span>
                    <span>${currency} ${parseFloat(invoice.grand_total).toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Total Paid Previously:</span>
                    <span>${currency} ${parseFloat(parseFloat(invoice.paid_amount) - parseFloat(payment.amount)).toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>Amount Collected Now:</span>
                    <span>${currency} ${parseFloat(payment.amount).toFixed(2)}</span>
                </div>
                <div class="summary-row" style="margin-top: 15px; font-weight: 700; color: #dc2626;">
                    <span>Remaining Balance:</span>
                    <span>${currency} ${parseFloat(payment.remaining_balance).toFixed(2)}</span>
                </div>
            </div>

            <div class="info-item" style="margin-bottom: 20px;">
                <label>Payment Method</label>
                <span style="text-transform: uppercase;">${payment.payment_method}</span>
            </div>

            <div class="footer">
                <p>This is a computer generated receipt for your due payment.</p>
                <p>Thank you for your business!</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const generateInvoicePDF = async (invoice, shop) => {
    const html = generateHTML(invoice, shop);
    return await renderPDF(html);
};

const generateDueReceiptPDF = async (payment, invoice, shop) => {
    const html = generateDueReceiptHTML(payment, invoice, shop);
    return await renderPDF(html);
};

const renderPDF = async (html) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: isProduction
            ? '/usr/bin/google-chrome-stable'
            : undefined, // use puppeteer's bundled Chrome in dev
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--single-process'
        ]
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
    });
    await browser.close();
    return pdfBuffer;
};

module.exports = { generateInvoicePDF, generateDueReceiptPDF };
