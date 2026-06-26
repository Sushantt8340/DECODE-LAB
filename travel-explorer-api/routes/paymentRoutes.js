const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');

// POST /api/payments/order - Create a Razorpay order
router.post('/order', createOrder);

// POST /api/payments/verify - Verify signature
router.post('/verify', verifyPayment);

module.exports = router;
