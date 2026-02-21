const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Shop = require('./Shop');
const Product = require('./Product');

const Return = sequelize.define('Return', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    shop_id: { type: DataTypes.UUID, allowNull: false, references: { model: Shop, key: 'id' } },
    product_id: { type: DataTypes.UUID, allowNull: false, references: { model: Product, key: 'id' } },
    invoice_ref: { type: DataTypes.STRING(50), allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.STRING(255), allowNull: true },
    refund_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    return_date: { type: DataTypes.DATEONLY, allowNull: false }
}, { tableName: 'returns', timestamps: true, createdAt: 'created_at', updatedAt: false });

// Associations defined centrally in models/index.js

module.exports = Return;

