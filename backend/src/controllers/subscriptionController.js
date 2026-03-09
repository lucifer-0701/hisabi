const { Shop } = require('../../../database/models');
const { getPlanLimits, PLAN_LIMITS } = require('../middleware/planMiddleware');

const getSubscription = async (req, res) => {
    try {
        const shop = await Shop.findByPk(req.user.shop_id);
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        res.json({
            plan: shop.plan,
            limits: getPlanLimits(shop.plan),
            allPlans: {
                free: { price: 0, limits: PLAN_LIMITS.free },
                gold: { price: 499, limits: PLAN_LIMITS.gold },
                premium: { price: 999, limits: PLAN_LIMITS.premium },
            }
        });
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ error: 'Failed to fetch subscription' });
    }
};

const upgradePlan = async (req, res) => {
    try {
        const { plan } = req.body;

        if (!['free', 'gold', 'premium'].includes(plan)) {
            return res.status(400).json({ error: 'Invalid plan. Must be free, gold, or premium.' });
        }

        const shop = await Shop.findByPk(req.user.shop_id);
        if (!shop) {
            return res.status(404).json({ error: 'Shop not found' });
        }

        shop.plan = plan;
        await shop.save();

        res.json({
            message: `Plan updated to ${plan.charAt(0).toUpperCase() + plan.slice(1)} successfully!`,
            plan: shop.plan,
            limits: getPlanLimits(shop.plan)
        });
    } catch (error) {
        console.error('Upgrade plan error:', error);
        res.status(500).json({ error: 'Failed to upgrade plan' });
    }
};

module.exports = { getSubscription, upgradePlan };
