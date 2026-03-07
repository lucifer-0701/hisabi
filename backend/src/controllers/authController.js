const Joi = require('joi');
const { sequelize } = require('../../../database/database');
const { Shop, User } = require('../../../database/models');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/token');

const registerSchema = Joi.object({
    shop_name: Joi.string().required(),
    address: Joi.string().allow('', null),
    trn: Joi.string().allow('', null),
    currency: Joi.string().valid('AED', 'KWD').required(),
    vat_enabled: Joi.boolean().required(),
    phone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
    shop_name: Joi.string().required(),
    username: Joi.string().required(),
    password: Joi.string().required()
});

const createStaffSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required()
});

const updateProfileSchema = Joi.object({
    username: Joi.string().min(3).max(30).allow('', null),
    password: Joi.string().min(6).allow('', null),
    shop_name: Joi.string().allow('', null),
    address: Joi.string().allow('', null),
    phone: Joi.string().allow('', null),
    email: Joi.string().email().allow('', null),
    trn: Joi.string().allow('', null)
});

const register = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { shop_name, address, trn, currency, vat_enabled, phone, email, username, password } = req.body;

        // Check if shop name exists
        const existingShop = await Shop.findOne({ where: { name: shop_name } });
        if (existingShop) {
            await t.rollback();
            return res.status(400).json({ error: 'Shop name already exists' });
        }

        // Create Shop
        const shop = await Shop.create({
            name: shop_name,
            address,
            trn,
            currency,
            vat_enabled,
            phone,
            email
        }, { transaction: t });

        // Hash Password
        const hashedPassword = await hashPassword(password);

        // Create Admin User
        const user = await User.create({
            shop_id: shop.id,
            username,
            password_hash: hashedPassword,
            role: 'admin'
        }, { transaction: t });

        await t.commit();

        // Generate Token
        const token = generateToken({ id: user.id, shop_id: shop.id, role: user.role });

        res.status(201).json({
            message: 'Shop registered successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                shop_id: shop.id
            },
            shop
        });
    } catch (error) {
        await t.rollback();
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};

const login = async (req, res) => {
    try {
        const { shop_name, username, password } = req.body;

        // Find Shop
        const shop = await Shop.findOne({ where: { name: shop_name } });
        if (!shop) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Find User in Shop
        const user = await User.findOne({
            where: {
                shop_id: shop.id,
                username
            }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check Password
        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const token = generateToken({ id: user.id, shop_id: shop.id, role: user.role });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                shop_id: shop.id
            },
            shop: {
                id: shop.id,
                name: shop.name,
                currency: shop.currency,
                vat_enabled: shop.vat_enabled,
                phone: shop.phone,
                email: shop.email
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

const createStaff = async (req, res) => {
    try {
        const { username, password } = req.body;
        const shop_id = req.user.shop_id;

        // Check if username exists in this shop
        const existingUser = await User.findOne({ where: { shop_id, username } });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists in this shop' });
        }

        const hashedPassword = await hashPassword(password);

        const user = await User.create({
            shop_id,
            username,
            password_hash: hashedPassword,
            role: 'staff'
        });

        res.status(201).json({
            message: 'Staff created successfully',
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Create Staff Error:', error);
        res.status(500).json({ error: 'Failed to create staff' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user_id = req.user.id;
        const shop_id = req.user.shop_id;

        const user = await User.findByPk(user_id, {
            attributes: ['id', 'username', 'role']
        });
        const shop = await Shop.findByPk(shop_id);

        res.json({ user, shop });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { username, password, shop_name, address, phone, email, trn } = req.body;
        const user_id = req.user.id;
        const shop_id = req.user.shop_id;

        const user = await User.findByPk(user_id);
        const shop = await Shop.findByPk(shop_id);

        if (!user || !shop) {
            return res.status(404).json({ error: 'User or Shop not found' });
        }

        // Update User details
        if (username) user.username = username;
        if (password) {
            user.password_hash = await hashPassword(password);
        }
        await user.save();

        // Update Shop details
        if (shop_name) shop.name = shop_name;
        if (address !== undefined) shop.address = address;
        if (phone !== undefined) shop.phone = phone;
        if (email !== undefined) shop.email = email;
        if (trn !== undefined) shop.trn = trn;
        await shop.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            },
            shop: {
                id: shop.id,
                name: shop.name,
                address: shop.address,
                phone: shop.phone,
                email: shop.email,
                trn: shop.trn,
                currency: shop.currency,
                vat_enabled: shop.vat_enabled
            }
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

module.exports = {
    register,
    login,
    createStaff,
    getProfile,
    updateProfile,
    registerSchema,
    loginSchema,
    createStaffSchema,
    updateProfileSchema
};
