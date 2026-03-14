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

        const username = 'abdulhussain2688';
        const password = 'D68*#M8X#@#HT2%!f47';
        const secretKey = 'hisabi-pos-2026-abdul-hussain-2688';

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
