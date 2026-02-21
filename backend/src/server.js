const app = require('./app');
const { syncDatabase, sequelize } = require('./models');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Bind to all interfaces — required for Railway/Docker

const startServer = async () => {
    try {
        // Authenticate with DB
        await sequelize.authenticate();
        console.log('Database connected.');

        // Sync models
        await syncDatabase();

        app.listen(PORT, HOST, () => {
            console.log(`Server is running on ${HOST}:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
