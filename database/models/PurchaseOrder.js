const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const Shop = require('./Shop');
const Supplier = require('./Supplier');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    shop_id: { type: DataTypes.UUID, allowNull: false, references: { model: Shop, key: 'id' } },
    supplier_id: { type: DataTypes.UUID, allowNull: true, references: { model: Supplier, key: 'id' } },
    order_date: { type: DataTypes.DATEONLY, allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    notes: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'purchase_orders', timestamps: true, createdAt: 'created_at', updatedAt: false });

// Associations defined centrally in models/index.js

module.exports = PurchaseOrder;

