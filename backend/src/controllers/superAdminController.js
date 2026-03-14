const {
    SuperAdmin, Advertisement, DiscountCode, sequelize,
    Shop, User, Product, Invoice, Announcement, ActivityLog
} = require('../../../database/models');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/token');

// Helper for Activity Logging
const logActivity = async (adminUsername, action, details = {}) => {
    try {
        await ActivityLog.create({
            admin_username: adminUsername,
            action,
            details
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

const login = async (req, res) => {
    try {
        const { username, password, secret_key } = req.body;
        console.log(`[SuperAdminLogin] Attempt for username: "${username}"`);

        await SuperAdmin.sync({ alter: true });

        const admin = await SuperAdmin.findOne({
            where: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('username')),
                sequelize.fn('LOWER', username)
            )
        });

        if (!admin) {
            return res.status(401).json({ error: 'Identity not recognized' });
        }

        const isPasswordMatch = await comparePassword(password, admin.password_hash);
        const isSecretKeyMatch = await comparePassword(secret_key, admin.secret_key_hash);

        if (!isPasswordMatch || !isSecretKeyMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = generateToken({ id: admin.id, role: 'super-admin', username: admin.username });

        await logActivity(admin.username, 'LOGIN', { ip: req.ip });

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
        res.status(500).json({ error: 'Login connectivity issue.' });
    }
};

const checkSetupStatus = async (req, res) => {
    try {
        await SuperAdmin.sync({ alter: true });
        const count = await SuperAdmin.count();
        res.json({ isInitialized: count > 0 });
    } catch (error) {
        res.json({ isInitialized: false });
    }
};

const initializeSuperAdmin = async (req, res) => {
    try {
        const { username, password, secret_key, bootstrap_secret } = req.body;
        const masterSecret = process.env.SUPER_ADMIN_BOOTSTRAP_SECRET || 'initial-setup-must-set-this';

        if (bootstrap_secret !== masterSecret) {
            return res.status(403).json({ error: 'Master Bootstrap Secret is incorrect' });
        }

        await SuperAdmin.sync({ alter: true });
        const count = await SuperAdmin.count();
        if (count > 0) return res.status(403).json({ error: 'System already initialized' });

        const passwordHash = await hashPassword(password);
        const secretKeyHash = await hashPassword(secret_key);

        const admin = await SuperAdmin.create({
            username,
            password_hash: passwordHash,
            secret_key_hash: secretKeyHash
        });

        await logActivity(username, 'SYSTEM_INITIALIZATION', { message: 'First Super Admin created' });

        res.status(201).json({ message: 'Super Admin initialized successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to initialize system' });
    }
};

// --- NEW FEATURES ---

// 1. System Analytics
const getAnalytics = async (req, res) => {
    try {
        const [
            totalShops,
            activeShops,
            totalInvoices,
            totalProducts,
            revenueData
        ] = await Promise.all([
            Shop.count(),
            Shop.count({ where: { active: true } }),
            Invoice.count(),
            Product.count(),
            Invoice.sum('total_amount')
        ]);

        res.json({
            shops: { total: totalShops, active: activeShops },
            usage: { invoices: totalInvoices, products: totalProducts },
            revenue: revenueData || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};

// 2. Shop Management
const getAllShops = async (req, res) => {
    try {
        const shops = await Shop.findAll({
            attributes: [
                'id', 'name', 'email', 'phone', 'plan', 'active', 'created_at',
                [sequelize.literal('(SELECT COUNT(*) FROM products WHERE products.shop_id = "Shop".id)'), 'productCount'],
                [sequelize.literal('(SELECT COUNT(*) FROM invoices WHERE invoices.shop_id = "Shop".id)'), 'invoiceCount'],
                [sequelize.literal('(SELECT COUNT(*) FROM users WHERE users.shop_id = "Shop".id)'), 'staffCount']
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(shops);
    } catch (error) {
        console.error('Fetch shops error:', error);
        res.status(500).json({ error: 'Failed to fetch shops' });
    }
};

const updateShop = async (req, res) => {
    try {
        const { id } = req.params;
        const { active, plan } = req.body;
        const shop = await Shop.findByPk(id);
        if (!shop) return res.status(404).json({ error: 'Shop not found' });

        const updateData = {};
        if (active !== undefined) updateData.active = active;
        if (plan !== undefined) updateData.plan = plan;

        console.log(`[SuperAdmin] Updating shop ${id}:`, updateData);
        await shop.update(updateData);

        await logActivity(req.superAdmin.username, 'UPDATE_SHOP', {
            shopId: id, shopName: shop.name, changes: updateData
        });

        res.json({ message: 'Shop updated successfully', shop });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update shop' });
    }
};

// 3. Announcement Management
const getAnnouncements = async (req, res) => {
    try {
        const list = await Announcement.findAll({ order: [['created_at', 'DESC']] });
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
};

const createAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.create(req.body);
        await logActivity(req.superAdmin.username, 'CREATE_ANNOUNCEMENT', { id: announcement.id });
        res.status(201).json(announcement);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create announcement' });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await Announcement.destroy({ where: { id } });
        await logActivity(req.superAdmin.username, 'DELETE_ANNOUNCEMENT', { id });
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

// 4. Activity Logs
const getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.findAll({
            limit: 100,
            order: [['created_at', 'DESC']]
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};

// --- EXISTING AD/DISCOUNT FEATURES ---
const getAds = async (req, res) => {
    try {
        const ads = await Advertisement.findAll();
        res.json(ads);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

const createAd = async (req, res) => {
    try {
        const ad = await Advertisement.create(req.body);
        await logActivity(req.superAdmin.username, 'CREATE_AD', { id: ad.id });
        res.status(201).json(ad);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

const updateAd = async (req, res) => {
    try {
        const { id } = req.params;
        const ad = await Advertisement.findByPk(id);
        if (!ad) return res.status(404).json({ error: 'Not found' });
        await ad.update(req.body);
        await logActivity(req.superAdmin.username, 'UPDATE_AD', { id });
        res.json(ad);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

const deleteAd = async (req, res) => {
    try {
        const { id } = req.params;
        await Advertisement.destroy({ where: { id } });
        await logActivity(req.superAdmin.username, 'DELETE_AD', { id });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

const getDiscounts = async (req, res) => {
    try {
        const discounts = await DiscountCode.findAll({ where: { shop_id: null } });
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

const createDiscount = async (req, res) => {
    try {
        const discount = await DiscountCode.create({ ...req.body, shop_id: null });
        await logActivity(req.superAdmin.username, 'CREATE_PLATFORM_DISCOUNT', { code: discount.code });
        res.status(201).json(discount);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

const updateDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const d = await DiscountCode.findOne({ where: { id, shop_id: null } });
        if (!d) return res.status(404).json({ error: 'Not found' });
        await d.update(req.body);
        await logActivity(req.superAdmin.username, 'UPDATE_PLATFORM_DISCOUNT', { code: d.code });
        res.json(d);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

const deleteDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        await DiscountCode.destroy({ where: { id, shop_id: null } });
        await logActivity(req.superAdmin.username, 'DELETE_PLATFORM_DISCOUNT', { id });
        res.json({ message: 'Deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

module.exports = {
    login, checkSetupStatus, initializeSuperAdmin,
    getAnalytics, getAllShops, updateShop,
    getAnnouncements, createAnnouncement, deleteAnnouncement,
    getActivityLogs,
    getAds, createAd, updateAd, deleteAd,
    getDiscounts, createDiscount, updateDiscount, deleteDiscount
};
