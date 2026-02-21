const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StockAdjustment = sequelize.define('StockAdjustment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    shop_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID, allowNull: false },
    quantity_change: { type: DataTypes.INTEGER, allowNull: false },
    type: {
        type: DataTypes.ENUM('add', 'remove', 'correction'),
        allowNull: false,
        defaultValue: 'correction'
    },
    reason: { type: DataTypes.STRING(255), allowNull: true },
    adjusted_by: { type: DataTypes.UUID, allowNull: true }
}, { tableName: 'stock_adjustments', timestamps: true, createdAt: 'created_at', updatedAt: false });

// Associations defined centrally in models/index.js

module.exports = StockAdjustment;
