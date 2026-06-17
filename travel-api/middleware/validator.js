/**
 * Input Validation Middleware
 */

// Helper to check standard email format
const isValidEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

/**
 * Validates travel booking requests
 */
const validateBooking = (req, res, next) => {
    const { fullName, email, destination, travelDate } = req.body;
    const errors = [];

    // Full Name validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
        errors.push("Full Name is required and must be a non-empty string");
    }

    // Email validation
    if (!email || typeof email !== 'string' || email.trim() === '') {
        errors.push("Email is required");
    } else if (!isValidEmail(email.trim())) {
        errors.push("Email must be a valid email address");
    }

    // Destination validation
    if (!destination || typeof destination !== 'string' || destination.trim() === '') {
        errors.push("Destination is required and must be a non-empty string");
    }

    // Travel Date validation
    if (!travelDate || typeof travelDate !== 'string' || travelDate.trim() === '') {
        errors.push("Travel Date is required");
    } else {
        const parsedDate = Date.parse(travelDate);
        if (isNaN(parsedDate)) {
            errors.push("Travel Date must be a valid date format (e.g. YYYY-MM-DD)");
        }
    }

    // Return 400 Bad Request if validation fails
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors,
            data: null
        });
    }

    next();
};

/**
 * Validates contact form requests
 */
const validateContact = (req, res, next) => {
    const { name, email, message } = req.body;
    const errors = [];

    // Name validation
    if (!name || typeof name !== 'string' || name.trim() === '') {
        errors.push("Name is required and must be a non-empty string");
    }

    // Email validation
    if (!email || typeof email !== 'string' || email.trim() === '') {
        errors.push("Email is required");
    } else if (!isValidEmail(email.trim())) {
        errors.push("Email must be a valid email address");
    }

    // Message validation
    if (!message || typeof message !== 'string' || message.trim() === '') {
        errors.push("Message is required and must be a non-empty string");
    }

    // Return 400 Bad Request if validation fails
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors,
            data: null
        });
    }

    next();
};

module.exports = {
    validateBooking,
    validateContact
};
