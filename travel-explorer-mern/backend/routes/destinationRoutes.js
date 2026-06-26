const express = require('express');
const router = express.Router();
const { 
    getDestinations, 
    getDestinationById, 
    createDestination, 
    updateDestination, 
    deleteDestination 
} = require('../controllers/destinationController');

// GET /api/destinations - Get all destinations (with optional search query)
router.get('/', getDestinations);

// GET /api/destinations/:id - Get a destination by its ID
router.get('/:id', getDestinationById);

// POST /api/destinations - Create a new destination
router.post('/', createDestination);

// PUT /api/destinations/:id - Update a destination by ID
router.put('/:id', updateDestination);

// DELETE /api/destinations/:id - Delete a destination by ID
router.delete('/:id', deleteDestination);

module.exports = router;
