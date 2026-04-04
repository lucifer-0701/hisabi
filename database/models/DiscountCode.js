const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const DiscountCode = sequelize.define('DiscountCode', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    shop_id: { type: DataTypes.UUID, allowNull: true },
    code: { type: DataTypes.STRING(50), allowNull: false },
    type: { type: DataTypes.ENUM('percent', 'fixed'), allowNull: false, defaultValue: 'percent' },
    value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    min_order_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    max_uses: { type: DataTypes.INTEGER, allowNull: true },
    used_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'discount_codes', timestamps: true, createdAt: 'created_at', updatedAt: false });

// Static validation method
DiscountCode.validate = async function(code, shop_id = null, order_total = 0) {
    const { Op } = require('sequelize');
    const dc = await this.findOne({
        where: {
            shop_id,
            code: code.toUpperCase(),
            active: true,
            [Op.or]: [{ expires_at: null }, { expires_at: { [Op.gte]: new Date() } }]
        }
    });

    if (!dc) throw new Error('Invalid or expired code');
    if (dc.max_uses && dc.used_count >= dc.max_uses) throw new Error('Code usage limit reached');
    if (order_total < parseFloat(dc.min_order_amount)) throw new Error(`Minimum order amount is ${dc.min_order_amount}`);

    const discount_amount = dc.type === 'percent'
        ? (order_total * parseFloat(dc.value) / 100)
        : parseFloat(dc.value);

    return { 
        valid: true, 
        discount_amount: Math.min(discount_amount, order_total), 
        code: dc 
    };
};

module.exports = DiscountCode;
