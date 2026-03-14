const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const SuperAdmin = sequelize.define('SuperAdmin', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    secret_key_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    tableName: 'super_admins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = SuperAdmin;
