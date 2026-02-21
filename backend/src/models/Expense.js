const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Shop = require('./Shop');

const Expense = sequelize.define('Expense', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    shop_id: { type: DataTypes.UUID, allowNull: false, references: { model: Shop, key: 'id' } },
    title: { type: DataTypes.STRING(150), allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    category: {
        type: DataTypes.ENUM('Rent', 'Utilities', 'Salaries', 'Supplies', 'Maintenance', 'Other'),
        allowNull: false,
        defaultValue: 'Other'
    },
    expense_date: { type: DataTypes.DATEONLY, allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'expenses', timestamps: true, createdAt: 'created_at', updatedAt: false });

// Associations defined centrally in models/index.js

module.exports = Expense;

