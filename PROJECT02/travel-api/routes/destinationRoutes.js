const express = require('express');
const router = express.Router();
const { getDestinations, getDestinationById } = require('../controllers/destinationController');

// GET /api/destinations - Get all destinations (with optional search query)
router.get('/', getDestinations);

// GET /api/destinations/:id - Get a destination by its ID
router.get('/:id', getDestinationById);

module.exports = router;
