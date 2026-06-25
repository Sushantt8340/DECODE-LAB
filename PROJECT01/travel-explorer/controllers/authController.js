/**
 * Auth Controller
 * Handles user registration, login, profile fetching, password reset, and wishlist management using MongoDB/Mongoose.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'bharatsafar_super_secret_key';

/**
 * @desc    Register a new customer
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required",
                data: null
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already registered",
                data: null
            });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phone: phone ? phone.trim() : '',
            role: 'user', // default role
            wishlist: []
        });

        await newUser.save();

        // Create JWT Token
        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Return user details without password
        const userObj = newUser.toJSON();
        delete userObj.password;

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: userObj,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
                data: null
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
                data: null
            });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
                data: null
            });
        }

        // Create JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        const userObj = user.toJSON();
        delete userObj.password;

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            data: {
                user: userObj,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current logged in user details
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }

        const userObj = user.toJSON();
        delete userObj.password;

        res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            data: userObj
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reset password for a user
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and newPassword are required",
                data: null
            });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No user registered with this email address",
                data: null
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully",
            data: null
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user wishlist (add/remove destination ID)
 * @route   POST /api/auth/wishlist
 * @access  Private
 */
const updateWishlist = async (req, res, next) => {
    try {
        const { destinationId } = req.body;
        if (!destinationId) {
            return res.status(400).json({
                success: false,
                message: "Destination ID is required",
                data: null
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }

        const destIdx = user.wishlist.indexOf(destinationId);
        let action = '';
        if (destIdx > -1) {
            user.wishlist.splice(destIdx, 1);
            action = 'removed';
        } else {
            user.wishlist.push(destinationId);
            action = 'added';
        }

        await user.save();

        const userObj = user.toJSON();
        delete userObj.password;

        res.status(200).json({
            success: true,
            message: `Destination successfully ${action} from wishlist`,
            data: {
                wishlist: user.wishlist,
                user: userObj
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    resetPassword,
    updateWishlist,
    JWT_SECRET
};
