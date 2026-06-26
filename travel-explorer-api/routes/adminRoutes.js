const express = require('express');
const router = express.Router();
const { getStats, getContacts, updateBookingStatus } = require('../controllers/adminController');
const { createDestination, deleteDestination } = require('../controllers/destinationController');
const { protect, admin } = require('../middleware/authMiddleware');

// Secure all admin routes (Only authenticated System Admins can access)
router.use(protect);
router.use(admin);

// GET /api/admin/stats - Dashboard analytics summary
router.get('/stats', getStats);

// GET /api/admin/contacts - Retrieve customer contact form messages
router.get('/contacts', getContacts);

// PUT /api/admin/bookings/:id - Mark pending booking as paid
router.put('/bookings/:id', updateBookingStatus);

// POST /api/admin/destinations - Add a new destination
router.post('/destinations', createDestination);

// DELETE /api/admin/destinations/:id - Delete a destination
router.delete('/destinations/:id', deleteDestination);

module.exports = router;
