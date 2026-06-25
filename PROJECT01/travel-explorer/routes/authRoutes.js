const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, resetPassword, updateWishlist } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register - Register customer
router.post('/register', registerUser);

// POST /api/auth/login - Login user (customer/admin)
router.post('/login', loginUser);

// POST /api/auth/reset-password - Reset user password
router.post('/reset-password', resetPassword);

// GET /api/auth/me - Get current user profile (requires authentication token)
router.get('/me', protect, getMe);

// PUT /api/auth/wishlist - Toggle destination bookmark in user's wishlist
router.put('/wishlist', protect, updateWishlist);

module.exports = router;
