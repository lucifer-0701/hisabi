const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const SalesTarget = sequelize.define('SalesTarget', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    shop_id: { type: DataTypes.UUID, allowNull: false },
    month: { type: DataTypes.INTEGER, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    target_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false }
}, { tableName: 'sales_targets', timestamps: true, createdAt: 'created_at', updatedAt: false });

// Associations defined centrally in models/index.js

module.exports = SalesTarget;
