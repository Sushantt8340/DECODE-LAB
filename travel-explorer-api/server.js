/**
 * Travel Explorer & Booking Platform Backend API
 * Server Entry Point
 */

require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const destinationRoutes = require('./routes/destinationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Body Parser Middleware
app.use(express.json());

// Enable Simple CORS (Allow all origins/methods for development/flexibility)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Simple Request Logging Middleware
app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.originalUrl} - ${new Date().toLocaleTimeString()}`);
    next();
});

// Root Route - Welcome Message
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to BharatSafar (Travel Explorer & Booking Platform) REST API",
        endpoints: {
            destinations: {
                list: "GET /api/destinations",
                search: "GET /api/destinations?search=query",
                details: "GET /api/destinations/:id"
            },
            bookings: {
                create: "POST /api/bookings",
                list: "GET /api/bookings"
            },
            contact: {
                submit: "POST /api/contact"
            }
        }
    });
});

// Register API Routes
app.use('/api/destinations', destinationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// 404 Handler (Not Found)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `API Route not found: ${req.method} ${req.originalUrl}`,
        data: null
    });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to terminate server`);
    console.log(`==================================================`);
});
