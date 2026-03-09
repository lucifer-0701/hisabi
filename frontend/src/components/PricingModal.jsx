import React, { useEffect } from 'react';
import { X, Check, Crown, Star, Zap, Sparkles } from 'lucide-react';

const plans = [
    {
        name: 'Free',
        price: '₹0',
        period: '/month',
        description: 'For getting started',
        features: [
            'Basic tracking',
            'Standard dashboard',
            'Up to 50 products',
        ],
        cta: 'Current Plan',
        disabled: true,
        style: 'free',
        icon: Star,
    },
    {
        name: 'Gold',
        price: '₹499',
        period: '/month',
        description: 'Best for growing businesses',
        badge: 'Recommended',
        features: [
            'Advanced analytics',
            'Unlimited products',
            'Multi-user access',
            'Export reports (CSV/PDF)',
        ],
        cta: 'Upgrade to Gold',
        disabled: false,
        style: 'gold',
        icon: Crown,
    },
    {
        name: 'Premium',
        price: '₹999',
        period: '/month',
        description: 'For power users',
        features: [
            'Everything in Gold',
            'Unlimited history',
            'Priority support',
            'Custom branding',
        ],
        cta: 'Upgrade to Premium',
        disabled: false,
        style: 'premium',
        icon: Zap,
    },
];

const cardStyles = {
    free: {
        border: 'border-slate-200',
        iconBg: 'bg-slate-100 text-slate-500',
        btn: 'border-2 border-slate-200 text-slate-400 cursor-not-allowed',
        ring: '',
    },
    gold: {
        border: 'border-blue-500 ring-2 ring-blue-500/20',
        iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25',
        btn: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.97]',
        ring: '',
    },
    premium: {
        border: 'border-slate-200 hover:border-slate-300',
        iconBg: 'bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-800/25',
        btn: 'border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white active:scale-[0.97]',
        ring: '',
    },
};

const PricingModal = ({ isOpen, onClose }) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-y-auto animate-pricing-pop"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative px-8 pt-8 pb-6 text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full mb-4">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-wider">Pricing</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Choose Your Plan
                    </h2>
                    <p className="text-sm text-slate-400 font-medium mt-2 max-w-md mx-auto">
                        Unlock more features to accelerate your progress
                    </p>
                </div>

                {/* Cards */}
                <div className="px-6 pb-8 grid grid-cols-1 md:grid-cols-3 gap-5">
                    {plans.map((plan, idx) => {
                        const style = cardStyles[plan.style];
                        const Icon = plan.icon;
                        return (
                            <div
                                key={plan.name}
                                className={`
                                    relative flex flex-col rounded-2xl border p-6 transition-all duration-300
                                    ${style.border}
                                    ${plan.style === 'gold' ? 'md:scale-105 md:-my-2 md:shadow-xl' : 'hover:shadow-md'}
                                `}
                                style={{ animationDelay: `${idx * 80}ms` }}
                            >
                                {/* Badge */}
                                {plan.badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-lg shadow-blue-600/25">
                                            <Crown className="w-3 h-3" />
                                            {plan.badge}
                                        </span>
                                    </div>
                                )}

                                {/* Icon + Name */}
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${style.iconBg}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                                <p className="text-xs text-slate-400 font-medium mb-4">{plan.description}</p>

                                {/* Price */}
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-black text-slate-900 tracking-tight">{plan.price}</span>
                                    <span className="text-sm text-slate-400 font-semibold">{plan.period}</span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8 flex-1">
                                    {plan.features.map((feat) => (
                                        <li key={feat} className="flex items-start gap-2.5">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.style === 'gold'
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : plan.style === 'premium'
                                                        ? 'bg-slate-100 text-slate-700'
                                                        : 'bg-slate-100 text-slate-400'
                                                }`}>
                                                <Check className="w-3 h-3" strokeWidth={3} />
                                            </div>
                                            <span className="text-sm text-slate-600 font-medium">{feat}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <button
                                    disabled={plan.disabled}
                                    className={`
                                        w-full py-3 rounded-xl text-sm font-black transition-all duration-200
                                        ${style.btn}
                                    `}
                                >
                                    {plan.cta}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Footer note */}
                <div className="px-8 pb-6 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                        All plans include a 14-day free trial · Cancel anytime
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PricingModal;
