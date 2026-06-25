/**
 * Review Controller
 * Handles reviews submission and retrieval using MongoDB.
 */

const Review = require('../models/Review');
const User = require('../models/User');

/**
 * @desc    Get all reviews for a destination
 * @route   GET /api/reviews/:destId
 * @access  Public
 */
const getReviewsForDestination = async (req, res, next) => {
    try {
        const { destId } = req.params;
        const reviews = await Review.find({ destinationId: destId }).sort({ createdAt: -1 });
        
        // Calculate average rating
        let averageRating = 0;
        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
            averageRating = parseFloat((sum / reviews.length).toFixed(1));
        }

        res.status(200).json({
            success: true,
            message: `Reviews retrieved for destination ${destId}`,
            data: {
                reviews,
                averageRating,
                totalReviews: reviews.length
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add a review for a destination
 * @route   POST /api/reviews
 * @access  Private (Authenticated)
 */
const addReview = async (req, res, next) => {
    try {
        const { destinationId, rating, comment } = req.body;

        if (!destinationId || !rating) {
            return res.status(400).json({
                success: false,
                message: "destinationId and rating are required",
                data: null
            });
        }

        const numRating = parseInt(rating, 10);
        if (isNaN(numRating) || numRating < 1 || numRating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5",
                data: null
            });
        }

        // Fetch user info to store name with review
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }

        // Check if there is an existing review by the user for this destination
        let review = await Review.findOne({ destinationId, userId: req.user.id });

        if (review) {
            // Update existing review
            review.rating = numRating;
            review.comment = comment ? comment.trim() : '';
            review.userName = user.name; // sync username in case it changed
            await review.save();
        } else {
            // Create a new review
            review = new Review({
                destinationId,
                userId: req.user.id,
                userName: user.name,
                rating: numRating,
                comment: comment ? comment.trim() : ''
            });
            await review.save();
        }

        res.status(201).json({
            success: true,
            message: "Review submitted successfully",
            data: review
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getReviewsForDestination,
    addReview
};
