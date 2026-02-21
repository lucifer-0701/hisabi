const { sequelize, Product, Shop, User } = require('./models');

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');

        // Find a shop first, create one if not exists (for testing)
        let shop = await Shop.findOne();
        if (!shop) {
            console.log('No shop found, cannot create product without shop_id');
            // Create a dummy shop? No, just exit.
            return;
        }

        console.log('Creating product...');
        const product = await Product.create({
            shop_id: shop.id,
            name: 'Debug Product ' + Date.now(),
            barcode: 'DBG' + Date.now(),
            cost_price: 100,
            selling_price: 150,
            stock_quantity: 10,
            image_path: '/uploads/debug.jpg' // Testing the new column
        });

        console.log('Product created successfully:', product.toJSON());

        // Clean up
        await product.destroy();
        console.log('Debug product deleted.');

    } catch (error) {
        console.error('FAILED:', error);
    } finally {
        await sequelize.close();
    }
};

run();
