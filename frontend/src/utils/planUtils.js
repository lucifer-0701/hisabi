export const PLAN_LIMITS = {
    free: {
        maxStaff: 2,
        historyMonths: 6,
        features: {
            reports: false,
            suppliers: false,
            purchases: false,
            endOfDay: false,
            discountCodes: false,
            salesTargets: false,
            prioritySupport: false,
            customBranding: false,
        }
    },
    gold: {
        maxStaff: 20,
        historyMonths: 24, // 2 years
        features: {
            reports: true,
            suppliers: true,
            purchases: true,
            endOfDay: true,
            discountCodes: true,
            salesTargets: true,
            prioritySupport: false,
            customBranding: false,
        }
    },
    premium: {
        maxStaff: Infinity,
        historyMonths: Infinity,
        features: {
            reports: true,
            suppliers: true,
            purchases: true,
            endOfDay: true,
            discountCodes: true,
            salesTargets: true,
            prioritySupport: true,
            customBranding: true,
        }
    }
};

export const getPlanLimits = (plan) => PLAN_LIMITS[plan] || PLAN_LIMITS.free;

/**
 * Maps frontend route/feature identifiers to the key in the features object above.
 */
export const FEATURE_MAP = {
    '/reports': 'reports',
    '/suppliers': 'suppliers',
    '/purchases': 'purchases',
    '/end-of-day': 'endOfDay',
    '/discount-codes': 'discountCodes',
    '/targets': 'salesTargets',
};
