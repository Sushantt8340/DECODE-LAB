const express = require('express');
const router = express.Router();
const { createBooking, getBookings } = require('../controllers/bookingController');
const { validateBooking } = require('../middleware/validator');

// POST /api/bookings - Create a new booking (with validation)
router.post('/', validateBooking, createBooking);

// GET /api/bookings - Get all bookings in memory
router.get('/', getBookings);

module.exports = router;
