/**
 * Contact Controller
 * Handles operations related to contact submissions
 */

// In-memory store for contact submissions
let contacts = [];

/**
 * @desc    Submit a new contact message
 * @route   POST /api/contact
 * @access  Public
 */
const submitContact = (req, res, next) => {
    try {
        const { name, email, message } = req.body;

        // Create new contact submission object
        const newContact = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            message: message.trim(),
            createdAt: new Date().toISOString()
        };

        // Save to in-memory array
        contacts.push(newContact);

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
