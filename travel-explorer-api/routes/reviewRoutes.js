const express = require('express');
const router = express.Router();
const { getReviewsForDestination, addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/reviews/:destId - Public route to fetch reviews for a destination
router.get('/:destId', getReviewsForDestination);

// POST /api/reviews - Private route to submit a rating and comment
router.post('/', protect, addReview);

module.exports = router;
