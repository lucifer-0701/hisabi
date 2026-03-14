const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { authenticateSuperAdmin } = require('../middleware/superAdminAuth');
const { Advertisement } = require('../../../database/models');

// Public ad fetch
router.get('/public/ads', async (req, res) => {
    try {
        const ads = await Advertisement.findAll({ where: { active: true } });
        res.json(ads);
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// Public Setup & Auth
router.get('/setup-status', superAdminController.checkSetupStatus);
router.post('/initialize', superAdminController.initializeSuperAdmin);
router.post('/login', superAdminController.login);

// Protected Management Routes
router.use(authenticateSuperAdmin);

// Analytics & System Stats
router.get('/analytics', superAdminController.getAnalytics);
router.get('/logs', superAdminController.getActivityLogs);

// Shop Management
router.get('/shops', superAdminController.getAllShops);
router.put('/shops/:id', superAdminController.updateShop);

// Announcements
router.get('/announcements', superAdminController.getAnnouncements);
router.post('/announcements', superAdminController.createAnnouncement);
router.delete('/announcements/:id', superAdminController.deleteAnnouncement);

// Ads
router.get('/ads', superAdminController.getAds);
router.post('/ads', superAdminController.createAd);
router.put('/ads/:id', superAdminController.updateAd);
router.delete('/ads/:id', superAdminController.deleteAd);

// Discounts
router.get('/discounts', superAdminController.getDiscounts);
router.post('/discounts', superAdminController.createDiscount);
router.put('/discounts/:id', superAdminController.updateDiscount);
router.delete('/discounts/:id', superAdminController.deleteDiscount);

module.exports = router;
