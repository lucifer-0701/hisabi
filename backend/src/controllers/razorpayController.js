const Razorpay = require('razorpay');
const crypto = require('crypto');
const { Shop, DiscountCode } = require('../../../database/models');

// Gracefully skip init if keys are not set
const razorpay = process.env.RAZORPAY_KEY_ID
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    })
    : null;

// Plan prices in paise (1 INR = 100 paise)
const PLAN_PRICES_INR = {
    gold: { amount: 49900 },   // ₹499
    premium: { amount: 99900 }    // ₹999
};

const PLATFORM_FEE_RATE = 0.02; // 2% platform fee

/**
 * Step 1: Create a Razorpay order before showing checkout UI
 */
const createOrder = async (req, res) => {
    if (!razorpay) {
        return res.status(503).json({ error: 'Payment gateway not configured' });
    }
    try {
        const { plan, discount_code } = req.body;
        const config = PLAN_PRICES_INR[plan];
        if (!config) return res.status(400).json({ error: 'Invalid plan' });

        const shop = await Shop.findByPk(req.user.shop_id);
        if (!shop) return res.status(404).json({ error: 'Shop not found' });

        if (shop.country !== 'IN') {
            return res.status(400).json({ error: 'Razorpay is available for Indian users only' });
        }

        let baseAmount = config.amount;
        let discountAmount = 0;

        // Apply Discount Code if provided
        if (discount_code) {
            try {
                const result = await DiscountCode.validate(discount_code, null, baseAmount / 100); // baseAmount is in paise
                discountAmount = result.discount_amount * 100;
                baseAmount = Math.max(0, baseAmount - discountAmount);
            } catch (err) {
                return res.status(400).json({ error: 'Invalid Discount Code' });
            }
        }

        const platformFee = Math.round(baseAmount * PLATFORM_FEE_RATE);
        const totalAmount = baseAmount + platformFee;

        const order = await razorpay.orders.create({
            amount: totalAmount,
            currency: 'INR',
            receipt: `hisabi_${req.user.shop_id.slice(0, 8)}_${Date.now()}`,
            notes: {
                shop_id: shop.id,
                plan,
                platform_fee: platformFee,
                discount_applied: discountAmount
            }
        });

        return res.json({
            order_id: order.id,
            amount: totalAmount,
            platform_fee: platformFee,
            discount: discountAmount,
            base: baseAmount,
            currency: 'INR',
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error('Razorpay createOrder error:', err);
        return res.status(500).json({ error: 'Failed to create payment order' });
    }
};

/**
 * Step 2: Verify payment signature after Razorpay checkout completion
 */
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
            return res.status(400).json({ error: 'Missing payment verification data' });
        }

        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (expected !== razorpay_signature) {
            return res.status(400).json({ error: 'Payment verification failed — signature mismatch' });
        }

        const shop = await Shop.findByPk(req.user.shop_id);
        await shop.update({ plan });

        return res.json({ success: true, plan });
    } catch (err) {
        console.error('Razorpay verifyPayment error:', err);
        return res.status(500).json({ error: 'Payment verification failed' });
    }
};

/**
 * Step 3: Webhook — called by Razorpay for subscription renewals/failures
 * Note: Uses raw body for signature verification (configured in app.js)
 */
const handleWebhook = async (req, res) => {
    try {
        const sig = req.headers['x-razorpay-signature'];
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!secret) return res.status(503).json({ error: 'Webhook not configured' });

        const expected = crypto
            .createHmac('sha256', secret)
            .update(req.body) // raw buffer — must use express.raw() for this route
            .digest('hex');

        if (expected !== sig) {
            return res.status(400).json({ error: 'Webhook signature invalid' });
        }

        const data = JSON.parse(req.body.toString());
        const { event, payload } = data;
        const paymentEntity = payload?.payment?.entity;
        const notes = paymentEntity?.notes || {};

        if (event === 'payment.captured' && notes.shop_id && notes.plan) {
            await Shop.update({ plan: notes.plan }, { where: { id: notes.shop_id } });
            console.log(`[Razorpay Webhook] Plan updated — shop: ${notes.shop_id}, plan: ${notes.plan}`);
        }

        if (event === 'payment.failed') {
            console.error(`[Razorpay Webhook] Payment failed — payment_id: ${paymentEntity?.id}`);
        }

        return res.json({ received: true });
    } catch (err) {
        console.error('Razorpay webhook error:', err);
        return res.status(500).json({ error: 'Webhook processing failed' });
    }
};

module.exports = { createOrder, verifyPayment, handleWebhook };
