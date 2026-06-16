const app = require('./app');
const { syncDatabase, sequelize } = require('../../database/models');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Bind to all interfaces — required for Railway/Docker

// Safety checks for critical environment variables
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET environment variable is not defined.');
    process.exit(1);
}
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    console.error('FATAL ERROR: JWT_SECRET must be at least 32 characters in production.');
    process.exit(1);
}

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
