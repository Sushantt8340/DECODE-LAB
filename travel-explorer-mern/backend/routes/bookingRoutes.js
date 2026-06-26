const express = require('express');
const router = express.Router();
const { 
    createBooking, 
    getBookings, 
    getBookingById, 
    updateBooking, 
    deleteBooking 
} = require('../controllers/bookingController');
const { validateBooking } = require('../middleware/validator');
const { protect } = require('../middleware/authMiddleware');

// POST /api/bookings - Create a new booking (with validation)
router.post('/', validateBooking, createBooking);

// GET /api/bookings - Get booking logs (requires auth, filters by user or returns all for admin)
router.get('/', protect, getBookings);

// GET /api/bookings/:id - Get a single booking by ID (requires auth)
router.get('/:id', protect, getBookingById);

// PUT /api/bookings/:id - Update a booking by ID (requires auth)
router.put('/:id', protect, updateBooking);

// DELETE /api/bookings/:id - Delete a booking by ID (requires auth)
router.delete('/:id', protect, deleteBooking);

module.exports = router;
