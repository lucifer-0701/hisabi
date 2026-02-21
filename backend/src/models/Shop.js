const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Shop = sequelize.define('Shop', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    trn: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    currency: {
        type: DataTypes.ENUM('AED', 'KWD'),
        allowNull: false
    },
    vat_enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true
    }
}, {
    tableName: 'shops',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false // Schema didn't specify updated_at, but usually good to have. Schema has created_at.
});

module.exports = Shop;
