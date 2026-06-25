/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
    // Log the error to console for server logs
    console.error(`[Error]: ${err.message || err}`);
    if (err.stack) {
        console.error(err.stack);
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === 'production' ? null : err.stack,
        data: null
    });
};

module.exports = errorHandler;
