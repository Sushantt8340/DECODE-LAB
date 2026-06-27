/**
 * Admin Controller
 * Handles operations related to the admin dashboard, including stats, listing contacts, and updating booking statuses using MongoDB.
 */

const Booking = require('../models/Booking');
const Contact = require('../models/Contact');
const Destination = require('../models/Destination');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * @desc    Get dashboard statistics summary
 * @route   GET /api/admin/stats
 * @access  Private (Admin Only)
 */
const getStats = async (req, res, next) => {
    try {
        const totalBookings = await Booking.countDocuments();
        
        // Sum total price of paid bookings
        const revenueResult = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        const paidCount = await Booking.countDocuments({ paymentStatus: 'paid' });
        const pendingCallbackCount = await Booking.countDocuments({ 
            paymentStatus: { $ne: 'paid' }, 
            paymentOption: 'pay_callback' 
        });
        const totalContacts = await Contact.countDocuments();
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
        const destinationsCount = await Destination.countDocuments();

        res.status(200).json({
            success: true,
            message: "Stats retrieved successfully",
            data: {
                totalBookings,
                totalRevenue,
                paidCount,
                pendingCallbackCount,
                totalContacts,
                totalUsers,
                destinationsCount
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all contact submissions
 * @route   GET /api/admin/contacts
 * @access  Private (Admin Only)
 */
const getContacts = async (req, res, next) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: "Contact messages retrieved successfully",
            data: contacts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a booking payment status
 * @route   PUT /api/admin/bookings/:id
 * @access  Private (Admin Only)
 */
const updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `Booking with ID "${id}" not found`,
                data: null
            });
        }

        // Update properties
        booking.paymentStatus = paymentStatus || 'paid';
        if (booking.paymentStatus === 'paid') {
            booking.bookingStatus = 'confirmed';
        }
        await booking.save();

        // Auto generate confirmation notification for the user
        try {
            const notification = new Notification({
                userId: booking.userId,
                email: booking.email,
                title: "Trip Booking Confirmed! 🎉",
                message: `Your travel package for ${booking.destination} on ${booking.travelDate} is confirmed. Payment has been verified by our expert.`,
                type: "success",
                read: false
            });
            await notification.save();
        } catch (err) {
            console.error('Failed to create confirmation notification/email:', err);
        }

        res.status(200).json({
            success: true,
            message: `Booking status updated successfully to "${booking.paymentStatus}"`,
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStats,
    getContacts,
    updateBookingStatus
};
