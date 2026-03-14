const { SuperAdmin, Advertisement, DiscountCode } = require('../../../database/models');
const { comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/token');

const login = async (req, res) => {
    try {
        const { username, password, secret_key } = req.body;

        const admin = await SuperAdmin.findOne({ where: { username } });
        if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

        const isPasswordMatch = await comparePassword(password, admin.password_hash);
        const isSecretKeyMatch = await comparePassword(secret_key, admin.secret_key_hash);

        if (!isPasswordMatch || !isSecretKeyMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
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
        res.status(500).json({ error: 'Login failed' });
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
    getAds, createAd, updateAd, deleteAd,
    getDiscounts, createDiscount, updateDiscount, deleteDiscount
};
