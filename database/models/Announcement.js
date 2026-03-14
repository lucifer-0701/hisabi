const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Announcement = sequelize.define('Announcement', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('info', 'warning', 'danger', 'success'),
        defaultValue: 'info'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'announcements',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Announcement;
