const { Shop } = require('../../../database/models');
const { PLAN_HIERARCHY, PLAN_LIMITS, getPlanLimits } = require('../utils/planUtils');

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

            if (shop.active === false) {
                return res.status(403).json({
                    error: 'Account Suspended',
                    message: 'Access denied. Your shop is currently suspended.'
                });
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
