const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { testConnection, sequelize } = require('./config/database');
const { syncDatabase } = require('./models');
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

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/stock-adjustments', stockAdjustmentRoutes);
app.use('/api/discount-codes', discountCodeRoutes);
app.use('/api/targets', salesTargetRoutes);
app.use('/api/due-payments', duePaymentRoutes);

// Serve built React frontend in production
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// React Router fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
});

module.exports = app;
