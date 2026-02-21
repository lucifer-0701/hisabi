const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const PurchaseOrder = require('./PurchaseOrder');
const Product = require('./Product');

const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    order_id: { type: DataTypes.UUID, allowNull: false, references: { model: PurchaseOrder, key: 'id' } },
    product_id: { type: DataTypes.UUID, allowNull: false, references: { model: Product, key: 'id' } },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unit_cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { tableName: 'purchase_order_items', timestamps: false });

// Associations defined centrally in models/index.js

module.exports = PurchaseOrderItem;
