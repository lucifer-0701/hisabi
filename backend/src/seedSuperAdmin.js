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

        const username = 'Abdul Husaain 2688';
        const password = 'D68*#M8X#@#HT2%!f47';
        const secretKey = 'hisabi-pos-2026-abdul-hussain-2688';

        const passwordHash = await hashPassword(password);
        const secretKeyHash = await hashPassword(secretKey);

        const [admin, created] = await SuperAdmin.findOrCreate({
            where: { username },
            defaults: {
                password_hash: passwordHash,
                secret_key_hash: secretKeyHash
            }
        });

        if (!created) {
            await admin.update({
                password_hash: passwordHash,
                secret_key_hash: secretKeyHash
            });
            console.log('Super Admin updated successfully.');
        } else {
            console.log('Super Admin created successfully.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error seeding Super Admin:', error);
        process.exit(1);
    }
};

seedSuperAdmin();
