import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/**
 * Dynamically loads the Razorpay checkout script on demand.
 * Safe to call multiple times — checks if already loaded.
 */
const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

/**
 * RazorpayCheckout
 * Renders a pay button that launches Razorpay modal for INR subscriptions.
 * Only shown to Indian shops (country === 'IN').
 *
 * Props:
 *   plan      — 'gold' | 'premium'
 *   onSuccess — called after successful payment + plan update
 *   className — optional button class overrides
 */
const RazorpayCheckout = ({ plan, onSuccess, className = '' }) => {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [discountError, setDiscountError] = useState('');

    const handlePayment = async () => {
        setLoading(true);
        setDiscountError('');

        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
            alert('Failed to load Razorpay SDK. Please check your internet connection.');
            setLoading(false);
            return;
        }

        try {
            // 1. Create order on backend (applies 2% platform fee, removes 18% GST)
            const { data } = await api.post('/razorpay/create-order', {
                plan,
                discount_code: discountCode.trim().toUpperCase()
            });

            // 2. Open Razorpay checkout
            const options = {
                key: data.key,
                amount: data.amount,
                currency: 'INR',
                name: 'Hisabi-POS',
                description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan · +2% Platform Fee (₹${(data.platform_fee / 100).toFixed(0)})${data.discount > 0 ? ` · Discount Applied: -₹${(data.discount / 100).toFixed(0)}` : ''}`,
                order_id: data.order_id,
                prefill: {
                    name: user?.username || '',
                    email: user?.shop?.email || ''
                },
                theme: { color: '#3b82f6' },
                modal: { ondismiss: () => setLoading(false) },
                handler: async (response) => {
                    try {
                        // 3. Verify payment on backend
                        const res = await api.post('/razorpay/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            plan
                        });

                        if (res.data.success) {
                            // 4. Update local auth context
                            setUser({
                                ...user,
                                shop: { ...user.shop, plan: res.data.plan }
                            });
                            onSuccess?.();
                        }
                    } catch (e) {
                        console.error('Payment verification error:', e);
                        alert('Payment verification failed. Contact support with your payment ID: ' + response.razorpay_payment_id);
                    } finally {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                console.error('Razorpay payment failed:', resp.error);
                alert(`Payment failed: ${resp.error.description}`);
                setLoading(false);
            });
            rzp.open();

        } catch (err) {
            console.error('Razorpay initiation error:', err);
            const errMsg = err.response?.data?.error || 'Could not initiate payment. Please try again.';
            if (errMsg === 'Invalid Discount Code') {
                setDiscountError(errMsg);
            } else {
                alert(errMsg);
            }
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Have a Discount Code?</label>
                <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter Code"
                    className={`w-full bg-slate-50 border ${discountError ? 'border-red-300' : 'border-slate-100'} rounded-xl px-4 py-2.5 text-sm font-bold focus:border-blue-500 outline-none transition-all`}
                />
                {discountError && <p className="text-[10px] font-bold text-red-500 px-1">{discountError}</p>}
            </div>

            <button
                onClick={handlePayment}
                disabled={loading}
                className={`w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all duration-200 ${loading
                    ? 'opacity-70 cursor-not-allowed bg-blue-400 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/25'
                    } ${className}`}
            >
                {loading ? (
                    <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Processing...
                    </>
                ) : (
                    <>
                        <span>Pay with Razorpay</span>
                        <span className="text-blue-200 font-medium text-xs">₹ INR</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default RazorpayCheckout;
