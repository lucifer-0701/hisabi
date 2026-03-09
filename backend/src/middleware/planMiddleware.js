const { Shop } = require('../../../database/models');

const PLAN_HIERARCHY = { free: 0, gold: 1, premium: 2 };

const PLAN_LIMITS = {
    free: {
        maxProducts: 50,
        exportReports: false,
        advancedAnalytics: false,
        multiUser: false,
        invoiceHistoryMonths: 6,
        customBranding: false,
    },
    gold: {
        maxProducts: Infinity,
        exportReports: true,
        advancedAnalytics: true,
        multiUser: true,
        invoiceHistoryMonths: 6,
        customBranding: false,
    },
    premium: {
        maxProducts: Infinity,
        exportReports: true,
        advancedAnalytics: true,
        multiUser: true,
        invoiceHistoryMonths: Infinity,
        customBranding: true,
    },
};

const getPlanLimits = (plan) => PLAN_LIMITS[plan] || PLAN_LIMITS.free;

/**
 * Middleware: require minimum plan level
 * Usage: requirePlan('gold')
 */
const requirePlan = (minPlan) => {
    return async (req, res, next) => {
        try {
            const shop = await Shop.findByPk(req.user.shop_id);
            if (!shop) {
                return res.status(404).json({ error: 'Shop not found' });
            }

            const shopLevel = PLAN_HIERARCHY[shop.plan] || 0;
            const requiredLevel = PLAN_HIERARCHY[minPlan] || 0;

            if (shopLevel < requiredLevel) {
                return res.status(403).json({
                    error: 'Plan upgrade required',
                    requiredPlan: minPlan,
                    currentPlan: shop.plan,
                    message: `This feature requires the ${minPlan.charAt(0).toUpperCase() + minPlan.slice(1)} plan or higher.`
                });
            }

            req.shopPlan = shop.plan;
            req.planLimits = getPlanLimits(shop.plan);
            next();
        } catch (error) {
            console.error('Plan check error:', error);
            res.status(500).json({ error: 'Failed to verify plan' });
        }
    };
};

module.exports = { requirePlan, getPlanLimits, PLAN_LIMITS, PLAN_HIERARCHY };
