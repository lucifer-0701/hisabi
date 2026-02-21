const { generateInvoicePDF } = require('./src/services/pdfService');
const fs = require('fs');
const path = require('path');

const sampleInvoice = {
    id: 123,
    date: new Date(),
    customer_name: 'John Doe',
    subtotal: 1000.00,
    tax_total: 50.00,
    discount: 10.00,
    grand_total: 1040.00,
    paid_amount: 500.00,
    due_amount: 540.00,
    InvoiceItems: [
        {
            Product: { name: 'Premium Laptop', description: 'Intel i7, 16GB RAM, 512GB SSD' },
            quantity: 1,
            unit_price: 900.00
        },
        {
            Product: { name: 'Wireless Mouse', description: 'Ergonomic design' },
            quantity: 2,
            unit_price: 50.00
        }
    ]
};

const sampleShop = {
    name: 'Hisabi Tech Solutions',
    address: '123 Tech Park, Dubai, UAE',
    phone: '+971 50 123 4567',
    email: 'info@hisabi.tech',
    vat_enabled: true,
    trn: '100234567890003',
    currency: 'AED'
};

async function testGeneration() {
    try {
        console.log('Generating sample PDF...');
        const pdfBuffer = await generateInvoicePDF(sampleInvoice, sampleShop);
        const outputPath = path.join(__dirname, 'sample_invoice.pdf');
        fs.writeFileSync(outputPath, pdfBuffer);
        console.log(`Sample PDF generated successfully at: ${outputPath}`);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}

testGeneration();
