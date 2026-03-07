const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');
const Shop = require('./Shop');

const Supplier = sequelize.define('Supplier', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    shop_id: { type: DataTypes.UUID, allowNull: false, references: { model: Shop, key: 'id' } },
    name: { type: DataTypes.STRING(100), allowNull: false },
    phone: { type: DataTypes.STRING(30), allowNull: true },
    email: { type: DataTypes.STRING(100), allowNull: true },
    contact_person: { type: DataTypes.STRING(100), allowNull: true }
}, { tableName: 'suppliers', timestamps: true, createdAt: 'created_at', updatedAt: false });

// Associations defined centrally in models/index.js

module.exports = Supplier;

