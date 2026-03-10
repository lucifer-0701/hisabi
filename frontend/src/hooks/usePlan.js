import { useAuth } from '../context/AuthContext';
import { getPlanLimits, FEATURE_MAP } from '../utils/planUtils';

/**
 * usePlan Hook
 * Provides helpers to check if a feature or route is locked for the current user.
 */
export const usePlan = () => {
    const { user } = useAuth();
    const plan = user?.shop?.plan || 'free';
    const limits = getPlanLimits(plan);

    /**
     * Checks if a specific feature or path is locked.
     * @param {string} identifier - e.g. '/reports' or 'customBranding'
     */
    const isLocked = (identifier) => {
        // If it's a known path, map it to the feature key
        const featureKey = FEATURE_MAP[identifier] || identifier;

        // If it's a feature key in our config, check its boolean status
        if (limits.features && typeof limits.features[featureKey] !== 'undefined') {
            return !limits.features[featureKey];
        }

        return false; // Default to unlocked if unknown
    };

    const getLimit = (type) => {
        return limits[type];
    };

    return {
        plan,
        limits,
        isLocked,
        getLimit,
        isPremium: plan === 'premium',
        isGold: plan === 'gold',
        isFree: plan === 'free',
    };
};

export default usePlan;
