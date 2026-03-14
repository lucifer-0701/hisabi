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

// Private
router.post('/login', superAdminController.login);

// Protected Management Routes
router.use(authenticateSuperAdmin);

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
