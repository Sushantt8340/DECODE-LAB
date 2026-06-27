/**
 * Booking Controller
 * Handles operations related to booking travel destinations (with MongoDB persistence)
 */

const Booking = require('../models/Booking');
const User = require('../models/User');
const Destination = require('../models/Destination');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'bharatsafar_super_secret_key';

/**
 * @desc    Create a new trip booking
 * @route   POST /api/bookings
 * @access  Public (Optionally authenticated)
 */
const createBooking = async (req, res, next) => {
    try {
        // Optionally extract user info from token if logged in
        let userId = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            try {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
                // Ignore invalid token and treat as anonymous booking / lookup by email
            }
        }
        
        const { 
            fullName, 
            email, 
            phone, 
            destination, 
            travelDate, 
            adults, 
            kids, 
            packageType, 
            totalPrice,
            paymentOption, 
            paymentStatus,
            razorpayPaymentId
        } = req.body;

        // Validation
        if (!email || !destination || !travelDate) {
            return res.status(400).json({
                success: false,
                message: "Email, destination, and travel date are required",
                data: null
            });
        }

        // 1. Resolve/Create User to link with the booking
        let user;
        if (userId) {
            user = await User.findById(userId);
        }
        if (!user && email) {
            user = await User.findOne({ email: email.toLowerCase().trim() });
        }
        if (!user) {
            // Auto-create a user account for guest to satisfy userId required rule
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('guest123', salt);
            user = new User({
                name: fullName ? fullName.trim() : email.split('@')[0],
                email: email.toLowerCase().trim(),
                phone: phone ? phone.trim() : '',
                password: hashedPassword,
                role: 'user'
            });
            await user.save();
        }
        userId = user._id;

        // 2. Resolve Destination ID
        let dest = await Destination.findOne({
            $or: [
                { title: new RegExp(`^${destination.trim()}$`, 'i') },
                { title: new RegExp(destination.trim(), 'i') }
            ]
        });

        // Fallback to first available destination if exact match not found
        if (!dest) {
            dest = await Destination.findOne();
        }

        const destinationId = dest ? dest._id : null;
        if (!destinationId) {
            return res.status(400).json({
                success: false,
                message: "A valid destination is required to create a booking",
                data: null
            });
        }

        const numAdults = parseInt(adults, 10) || 1;
        const numKids = parseInt(kids, 10) || 0;

        // Create new booking object
        const newBooking = new Booking({
            userId,
            destinationId,
            fullName: (fullName || user.name).trim(),
            email: email.toLowerCase().trim(),
            phone: (phone || user.phone || '').trim(),
            destination: destination.trim(),
            travelDate: travelDate,
            adults: numAdults,
            kids: numKids,
            persons: numAdults + numKids,
            packageType: packageType || 'Standard',
            totalPrice: parseFloat(totalPrice) || 0,
            paymentOption: paymentOption || 'pay_online',
            paymentStatus: paymentStatus || 'pending',
            bookingStatus: paymentStatus === 'paid' ? 'confirmed' : 'pending',
            razorpayPaymentId: razorpayPaymentId || null
        });

        await newBooking.save();

        // Auto generate notification for the user
        try {
            let notificationTitle = "Booking Placed! ✈️";
            let notificationMsg = `Your booking request for ${newBooking.destination} has been received.`;
            
            if (newBooking.paymentOption === 'pay_callback') {
                notificationTitle = "Callback Scheduled! 📞";
                notificationMsg = `A travel expert will call you at ${newBooking.phone} within 24 hours to plan your custom itinerary for ${newBooking.destination}.`;
            } else if (newBooking.paymentStatus === 'paid') {
                notificationTitle = "Booking Confirmed! 🎉";
                notificationMsg = `Your booking for ${newBooking.destination} on ${newBooking.travelDate} is confirmed. Payment verified.`;
            }
            
            const notification = new Notification({
                userId: userId,
                email: newBooking.email,
                title: notificationTitle,
                message: notificationMsg,
                type: newBooking.paymentStatus === 'paid' ? 'success' : 'info',
                read: false
            });
            await notification.save();
        } catch (err) {
            console.error('Failed to create booking notification/email:', err);
        }

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
 * @desc    Get bookings (User history or Admin logs)
 * @route   GET /api/bookings
 * @access  Private
 */
const getBookings = async (req, res, next) => {
    try {
        // If admin, return all bookings
        if (req.user && req.user.role === 'admin') {
            const bookings = await Booking.find()
                .populate('userId', 'name email phone')
                .populate('destinationId')
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                message: "All bookings retrieved successfully (Admin Access)",
                data: bookings
            });
        }

        // For regular logged-in users, return only their bookings (matched by userId or email)
        const user = await User.findById(req.user.id);
        const userEmail = user ? user.email.toLowerCase() : '';

        const userBookings = await Booking.find({
            $or: [
                { userId: req.user.id },
                { email: userEmail }
            ]
        })
        .populate('destinationId')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "User bookings history retrieved successfully",
            data: userBookings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get a single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBookingById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id)
            .populate('userId', 'name email phone')
            .populate('destinationId');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `Booking with ID "${id}" not found`,
                data: null
            });
        }

        // Check if user is authorized to see this booking (must be admin or booking owner)
        if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
            const user = await User.findById(req.user.id);
            if (!user || booking.email.toLowerCase() !== user.email.toLowerCase()) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden: Not authorized to view this booking",
                    data: null
                });
            }
        }

        res.status(200).json({
            success: true,
            message: "Booking retrieved successfully",
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a booking by ID
 * @route   PUT /api/bookings/:id
 * @access  Private
 */
const updateBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { travelDate, persons, bookingStatus, paymentStatus, adults, kids, packageType, totalPrice } = req.body;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `Booking with ID "${id}" not found`,
                data: null
            });
        }

        // Update fields if present in request
        if (travelDate !== undefined) booking.travelDate = travelDate;
        if (bookingStatus !== undefined) booking.bookingStatus = bookingStatus;
        if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus;
        if (packageType !== undefined) booking.packageType = packageType;
        if (totalPrice !== undefined) booking.totalPrice = totalPrice;

        // Sync adults/kids and persons
        if (adults !== undefined) booking.adults = parseInt(adults, 10);
        if (kids !== undefined) booking.kids = parseInt(kids, 10);
        if (adults !== undefined || kids !== undefined) {
            booking.persons = booking.adults + booking.kids;
        } else if (persons !== undefined) {
            booking.persons = parseInt(persons, 10);
        }

        await booking.save();

        res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            data: booking
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a booking by ID
 * @route   DELETE /api/bookings/:id
 * @access  Private
 */
const deleteBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `Booking with ID "${id}" not found`,
                data: null
            });
        }

        await Booking.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: `Booking "${id}" deleted successfully`,
            data: null
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBooking,
    getBookings,
    getBookingById,
    updateBooking,
    deleteBooking
};
