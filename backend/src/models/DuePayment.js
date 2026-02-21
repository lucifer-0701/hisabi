const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Shop = require('./Shop');
const Invoice = require('./Invoice');

const DuePayment = sequelize.define('DuePayment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    shop_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Shop,
            key: 'id'
        }
    },
    invoice_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Invoice,
            key: 'id'
        }
    },
    due_invoice_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.ENUM('cash', 'card', 'upi'),
        allowNull: false,
        defaultValue: 'cash'
    },
    payment_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    remaining_balance: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'due_payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = DuePayment;
