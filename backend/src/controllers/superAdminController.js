const { SuperAdmin, Advertisement, DiscountCode, sequelize } = require('../../../database/models');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/token');

const login = async (req, res) => {
    try {
        const { username, password, secret_key } = req.body;
        console.log(`[SuperAdminLogin] Attempt for username: "${username}"`);

        // Check if table exists first (prevents 500 error on first run)
        await SuperAdmin.sync({ alter: true });

        const admin = await SuperAdmin.findOne({
            where: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('username')),
                sequelize.fn('LOWER', username)
            )
        });

        if (!admin) {
            console.warn(`[SuperAdminLogin] Admin NOT FOUND for: "${username}"`);
            return res.status(401).json({ error: 'Identity not recognized' });
        }

        const isPasswordMatch = await comparePassword(password, admin.password_hash);
        console.log(`[SuperAdminLogin] Password match: ${isPasswordMatch}`);

        const isSecretKeyMatch = await comparePassword(secret_key, admin.secret_key_hash);
        console.log(`[SuperAdminLogin] Secret key match: ${isSecretKeyMatch}`);

        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid security credentials' });
        }

        if (!isSecretKeyMatch) {
            return res.status(401).json({ error: 'Invalid authority key' });
        }

        const token = generateToken({ id: admin.id, role: 'super-admin' });

        res.json({
            message: 'Super Admin login successful',
            token,
            user: {
                id: admin.id,
                username: admin.username,
                role: 'super-admin'
            }
        });
    } catch (error) {
        console.error('Super Admin Login Error:', error);
        res.status(500).json({ error: 'Login connectivity issue. Contact support.' });
    }
};

const checkSetupStatus = async (req, res) => {
    try {
        // Ensure table exists
        await SuperAdmin.sync({ alter: true });
        const count = await SuperAdmin.count();
        res.json({ isInitialized: count > 0 });
    } catch (error) {
        console.error('Setup check error:', error);
        // If table doesn't exist, it's definitely not initialized
        res.json({ isInitialized: false, note: 'Table auto-sync triggered' });
    }
};

const initializeSuperAdmin = async (req, res) => {
    try {
        const { username, password, secret_key, bootstrap_secret } = req.body;

        // 1. Security check: Master Bootstrap Secret
        const masterSecret = process.env.SUPER_ADMIN_BOOTSTRAP_SECRET || 'initial-setup-must-set-this';
        if (bootstrap_secret !== masterSecret) {
            return res.status(403).json({ error: 'Master Bootstrap Secret is incorrect' });
        }

        // 2. Safety check: Only allowed if count is 0
        await SuperAdmin.sync({ alter: true });
        const count = await SuperAdmin.count();
        if (count > 0) {
            return res.status(403).json({ error: 'System already initialized' });
        }

        // 3. Create Admin
        const passwordHash = await hashPassword(password);
        const secretKeyHash = await hashPassword(secret_key);

        const admin = await SuperAdmin.create({
            username,
            password_hash: passwordHash,
            secret_key_hash: secretKeyHash
        });

        res.status(201).json({ message: 'Super Admin initialized successfully', username: admin.username });
    } catch (error) {
        console.error('Initialization error:', error);
        res.status(500).json({ error: 'Failed to initialize system' });
    }
};

// Advertisement Management
const getAds = async (req, res) => {
    try {
        const ads = await Advertisement.findAll();
        res.json(ads);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ads' });
    }
};

const createAd = async (req, res) => {
    try {
        const ad = await Advertisement.create(req.body);
        res.status(201).json(ad);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create ad' });
    }
};

const updateAd = async (req, res) => {
    try {
        const { id } = req.params;
        const ad = await Advertisement.findByPk(id);
        if (!ad) return res.status(404).json({ error: 'Ad not found' });
        await ad.update(req.body);
        res.json(ad);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update ad' });
    }
};

const deleteAd = async (req, res) => {
    try {
        const { id } = req.params;
        const ad = await Advertisement.findByPk(id);
        if (!ad) return res.status(404).json({ error: 'Ad not found' });
        await ad.destroy();
        res.json({ message: 'Ad deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete ad' });
    }
};

// Platform-level Discount Code Management
const getDiscounts = async (req, res) => {
    try {
        const discounts = await DiscountCode.findAll({ where: { shop_id: null } });
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch discounts' });
    }
};

const createDiscount = async (req, res) => {
    try {
        const discount = await DiscountCode.create({ ...req.body, shop_id: null });
        res.status(201).json(discount);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create discount' });
    }
};

const updateDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await DiscountCode.findOne({ where: { id, shop_id: null } });
        if (!discount) return res.status(404).json({ error: 'Discount not found' });
        await discount.update(req.body);
        res.json(discount);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update discount' });
    }
};

const deleteDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await DiscountCode.findOne({ where: { id, shop_id: null } });
        if (!discount) return res.status(404).json({ error: 'Discount not found' });
        await discount.destroy();
        res.json({ message: 'Discount deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete discount' });
    }
};

module.exports = {
    login,
    checkSetupStatus,
    initializeSuperAdmin,
    getAds, createAd, updateAd, deleteAd,
    getDiscounts, createDiscount, updateDiscount, deleteDiscount
};
