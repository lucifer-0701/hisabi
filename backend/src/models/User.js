const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Shop = require('./Shop');

const User = sequelize.define('User', {
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
    username: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'staff'),
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
        {
            unique: true,
            fields: ['shop_id', 'username']
        }
    ]
});

// Associations defined centrally in models/index.js

module.exports = User;

