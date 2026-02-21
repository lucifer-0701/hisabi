const app = require('./app');
const { syncDatabase, sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Authenticate with DB
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync models
        await syncDatabase();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
