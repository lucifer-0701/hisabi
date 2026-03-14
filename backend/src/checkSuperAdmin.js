const { SuperAdmin } = require('../../database/models');
require('dotenv').config();

const checkSuperAdmin = async () => {
    try {
        const admins = await SuperAdmin.findAll();
        console.log(`\n--- Super Admin Check ---`);
        console.log(`Total Super Admins found: ${admins.length}`);

        admins.forEach(admin => {
            console.log(`- ID: ${admin.id}`);
            console.log(`  Username: ${admin.username}`);
            console.log(`  Password Hash (exists): ${!!admin.password_hash}`);
            console.log(`  Secret Hash (exists): ${!!admin.secret_key_hash}`);
            console.log('-------------------------');
        });

        process.exit(0);
    } catch (error) {
        console.error('Error checking Super Admin:', error);
        process.exit(1);
    }
};

checkSuperAdmin();
