/**
 * Payment Controller
 * Handles Razorpay Order Creation and Signature Verification (with Demo/Mock fallback if credentials are not configured)
 */

const crypto = require('crypto');
let Razorpay = null;

try {
    Razorpay = require('razorpay');
} catch (e) {
    console.warn('Razorpay package not found, using Mock Payments fallback');
}

// Razorpay Credentials (from env variables)
const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

let razorpayInstance = null;

if (KEY_ID && KEY_SECRET && Razorpay) {
    try {
        razorpayInstance = new Razorpay({
            key_id: KEY_ID,
            key_secret: KEY_SECRET
        });
        console.log('[Payment]: Razorpay successfully configured with credentials');
    } catch (err) {
        console.error('Failed to initialize Razorpay instance:', err);
    }
} else {
    console.log('[Payment]: Razorpay keys not provided. Running in Demo Mode (Mock Payments)');
}

/**
 * @desc    Create a new payment order
 * @route   POST /api/payments/order
 * @access  Public (or Private)
 */
const createOrder = async (req, res, next) => {
    try {
        const { amount, currency } = req.body;

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: "Amount is required",
                data: null
            });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise (1 INR = 100 paise)
            currency: currency || "INR",
            receipt: `rcpt_${Date.now()}_${Math.round(Math.random() * 1000)}`
        };

        // If Razorpay is configured, call the API
        if (razorpayInstance) {
            const order = await razorpayInstance.orders.create(options);
            return res.status(201).json({
                success: true,
                message: "Razorpay order created successfully",
                data: {
                    isMock: false,
                    keyId: KEY_ID,
                    orderId: order.id,
                    amount: order.amount,
                    currency: order.currency
                }
            });
        } else {
            // Running in Demo Mode (Mock Order creation)
            const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            return res.status(201).json({
                success: true,
                message: "Demo Payment Order created successfully (Sandbox)",
                data: {
                    isMock: true,
                    keyId: "rzp_test_mock_keys_123",
                    orderId: mockOrderId,
                    amount: options.amount,
                    currency: options.currency
                }
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payments/verify
 * @access  Public
 */
const verifyPayment = (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment credentials details missing",
                data: null
            });
        }

        // If mock payment, always pass verification
        if (isMock || razorpay_order_id.startsWith('order_mock_')) {
            return res.status(200).json({
                success: true,
                message: "Demo Payment verified successfully (Sandbox)",
                data: null
            });
        }

        // Real verification check using HMAC-SHA256
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                data: null
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Payment verification failed (signature mismatch)",
                data: null
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrder,
    verifyPayment
};
