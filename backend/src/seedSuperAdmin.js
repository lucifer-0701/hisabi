const { SuperAdmin, Advertisement, DiscountCode } = require('../../database/models');
const { hashPassword } = require('./utils/hash');
require('dotenv').config();

const seedSuperAdmin = async () => {
    try {
        console.log('Syncing SuperAdmin, Advertisement and DiscountCode models...');
        await SuperAdmin.sync({ alter: true });
        await Advertisement.sync({ alter: true });
        await DiscountCode.sync({ alter: true });
        console.log('Models synced.');

        // Clear existing super admins to ensure a fresh start
        await SuperAdmin.destroy({ where: {}, truncate: true });

        const path = require('path');
        require('dotenv').config({ path: path.join(__dirname, '../.env') });

        const username = process.env.SUPER_ADMIN_USERNAME;
        const password = process.env.SUPER_ADMIN_PASSWORD;
        const secretKey = process.env.SUPER_ADMIN_SECRET_KEY;

        if (!username || !password || !secretKey) {
            console.error('Error: SUPER_ADMIN_USERNAME, SUPER_ADMIN_PASSWORD, and SUPER_ADMIN_SECRET_KEY must be set in the environment variables (e.g., .env file).');
            process.exit(1);
        }

        const passwordHash = await hashPassword(password);
        const secretKeyHash = await hashPassword(secretKey);

        const admin = await SuperAdmin.create({
            username,
            password_hash: passwordHash,
            secret_key_hash: secretKeyHash
        });

        console.log('Super Admin created successfully:', username);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding Super Admin:', error);
        process.exit(1);
    }
};

seedSuperAdmin();
