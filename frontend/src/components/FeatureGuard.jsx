import React from 'react';
import { Lock } from 'lucide-react';
import { usePlan } from '../hooks/usePlan';

/**
 * FeatureGuard Component
 * Wraps content and shows a lock overlay if the feature is not available in the current plan.
 * 
 * Props:
 *   feature   - string (e.g. 'customBranding')
 *   children  - the content to protect
 *   fallback  - optional custom fallback UI
 *   className - optional classes for the wrapper
 */
const FeatureGuard = ({ feature, children, fallback, className = '' }) => {
    const { isLocked } = usePlan();
    const locked = isLocked(feature);

    if (!locked) return <>{children}</>;

    if (fallback) return <>{fallback}</>;

    return (
        <div className={`relative group ${className}`}>
            {/* Locked Content (blurred or desaturated) */}
            <div className="opacity-40 grayscale pointer-events-none select-none">
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-[1px] rounded-xl transition-all group-hover:bg-white/20">
                <div className="p-2 bg-white shadow-xl rounded-full border border-slate-100 transform transition-transform group-hover:scale-110">
                    <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <p className="mt-2 text-[10px] font-black text-slate-900 uppercase tracking-widest bg-white/90 px-3 py-1 rounded-full shadow-sm">
                    Upgrade to Unlock
                </p>
            </div>
        </div>
    );
};

export default FeatureGuard;
