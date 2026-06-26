const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../controllers/authController');

/**
 * Middleware to protect private routes (verifies JWT token)
 */
const protect = (req, res, next) => {
    let token;

    // Check header for authorization Bearer token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Attach user metadata to request object
            req.user = {
                id: decoded.id,
                role: decoded.role
            };

            next();
        } catch (error) {
            console.error('[Auth Error]: Token verification failed:', error.message);
            res.status(401);
            return next(new Error('Not authorized, token verification failed'));
        }
    }

    if (!token) {
        res.status(401);
        return next(new Error('Not authorized, no token provided'));
    }
};

/**
 * Middleware to restrict routes to Admin role only
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        return next(new Error('Forbidden, admin access only'));
    }
};

module.exports = {
    protect,
    admin
};
