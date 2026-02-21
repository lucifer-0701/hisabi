const { sequelize } = require('./src/config/database');

async function fixEnum() {
    try {
        console.log('Attempting to add "partial" to enum_invoices_status...');
        // Postgres Specific: Add value to ENUM type
        // Note: This must be run outside of a transaction or with specific care in Postgres
        await sequelize.query('ALTER TYPE "enum_invoices_status" ADD VALUE IF NOT EXISTS \'partial\'');
        console.log('Successfully added "partial" to enum_invoices_status');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await sequelize.close();
    }
}

fixEnum();
