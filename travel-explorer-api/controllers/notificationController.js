/**
 * Notification Controller
 * Handles user notifications using MongoDB.
 */

const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * @desc    Get notifications for currently logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
    try {
        // Find user by ID to get email
        const user = await User.findById(req.user.id);
        const userEmail = user ? user.email.toLowerCase() : '';

        // Filter notifications belonging to this user or matching their email
        const userNotifications = await Notification.find({
            $or: [
                { userId: req.user.id },
                { email: userEmail }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Notifications retrieved successfully",
            data: userNotifications
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const notification = await Notification.findById(id);
        
        if (notification) {
            notification.read = true;
            await notification.save();
        }

        res.status(200).json({
            success: true,
            message: "Notification marked as read successfully",
            data: null
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    markAsRead
};
