const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DiscountCode = sequelize.define('DiscountCode', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    shop_id: { type: DataTypes.UUID, allowNull: false },
    code: { type: DataTypes.STRING(50), allowNull: false },
    type: { type: DataTypes.ENUM('percent', 'fixed'), allowNull: false, defaultValue: 'percent' },
    value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    min_order_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    max_uses: { type: DataTypes.INTEGER, allowNull: true },
    used_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    expires_at: { type: DataTypes.DATE, allowNull: true }
}, { tableName: 'discount_codes', timestamps: true, createdAt: 'created_at', updatedAt: false });

// Associations defined centrally in models/index.js

module.exports = DiscountCode;
