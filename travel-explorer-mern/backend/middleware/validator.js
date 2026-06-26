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
    const { fullName, email, phone, destination, travelDate, adults, kids, packageType, totalPrice } = req.body;
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

    // Phone validation
    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
        errors.push("Phone number is required");
    } else {
        const cleanPhone = phone.replace(/[^\d]/g, '');
        if (cleanPhone.length < 10 || cleanPhone.length > 15) {
            errors.push("Phone number must be a valid digits sequence (min 10, max 15 digits)");
        }
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

    // Adults count validation
    if (adults === undefined || typeof adults !== 'number' || !Number.isInteger(adults) || adults < 1) {
        errors.push("Adults count is required, must be an integer, and must be at least 1");
    }

    // Kids count validation
    if (kids === undefined || typeof kids !== 'number' || !Number.isInteger(kids) || kids < 0) {
        errors.push("Kids count is required, must be an integer, and must be at least 0");
    }

    // Package Type validation
    if (!packageType || typeof packageType !== 'string' || !['basic', 'premium', 'luxury'].includes(packageType)) {
        errors.push("Package Type is required and must be one of: basic, premium, luxury");
    }

    // Total Price validation
    if (totalPrice === undefined || typeof totalPrice !== 'number' || totalPrice < 0) {
        errors.push("Total Price is required and must be a positive number");
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
