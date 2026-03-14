const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    admin_username: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    action: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    details: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    }
}, {
    tableName: 'activity_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

module.exports = ActivityLog;
