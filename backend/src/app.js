const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { testConnection, sequelize } = require('../../database/database');
const { syncDatabase } = require('../../database/models');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const customerRoutes = require('./routes/customerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const returnRoutes = require('./routes/returnRoutes');
const stockAdjustmentRoutes = require('./routes/stockAdjustmentRoutes');
const discountCodeRoutes = require('./routes/discountCodeRoutes');
const salesTargetRoutes = require('./routes/salesTargetRoutes');
const duePaymentRoutes = require('./routes/duePaymentRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const exportRoutes = require('./routes/exportRoutes');
const razorpayRoutes = require('./routes/razorpayRoutes');

const superAdminRoutes = require('./routes/superAdminRoutes');

const app = express();
// ... (omitted)
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/auth', authRoutes);

// CORS — allow requests from frontend (Vercel) or localhost in dev
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:3000',
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. Postman, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
}));

// Middleware - ORDER MATTERS
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));

// Razorpay Webhook needs RAW body for signature verification
// This must come BEFORE express.json()
app.use('/api/razorpay/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
const os = require('os');
const uploadDir = process.env.VERCEL
    ? path.join(os.tmpdir(), 'uploads')
    : path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

const { authenticate, requireAdmin } = require('./middleware/auth');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', requireAdmin, reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', requireAdmin, supplierRoutes);
app.use('/api/expenses', requireAdmin, expenseRoutes);
app.use('/api/purchases', requireAdmin, purchaseRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/stock-adjustments', stockAdjustmentRoutes);
app.use('/api/discount-codes', requireAdmin, discountCodeRoutes);
app.use('/api/targets', requireAdmin, salesTargetRoutes);
app.use('/api/due-payments', duePaymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/razorpay', razorpayRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
