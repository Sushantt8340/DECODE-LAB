/**
 * Contact Controller
 * Handles operations related to contact submissions using MongoDB.
 */

const Contact = require('../models/Contact');

/**
 * @desc    Submit a new contact message
 * @route   POST /api/contact
 * @access  Public
 */
const submitContact = async (req, res, next) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and message are required",
                data: null
            });
        }

        // Create new contact submission in database
        const newContact = new Contact({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim()
        });

        await newContact.save();

        res.status(201).json({
            success: true,
            message: "Contact submission received successfully",
            data: newContact
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitContact
};
