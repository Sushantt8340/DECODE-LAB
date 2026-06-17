/**
 * Booking Controller
 * Handles operations related to booking travel destinations
 */

// In-memory store for bookings
let bookings = [];

/**
 * @desc    Create a new trip booking
 * @route   POST /api/bookings
 * @access  Public
 */
const createBooking = (req, res, next) => {
    try {
        const { fullName, email, destination, travelDate } = req.body;

        // Create new booking object
        const newBooking = {
            id: `bk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            destination: destination.trim(),
            travelDate: travelDate,
            createdAt: new Date().toISOString()
        };

        // Save to in-memory array
        bookings.push(newBooking);

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: newBooking
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all bookings
 * @route   GET /api/bookings
 * @access  Public
 */
const getBookings = (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: bookings
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBooking,
    getBookings
};
