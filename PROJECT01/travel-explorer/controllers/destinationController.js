/**
 * Destination Controller
 * Handles operations related to travel destinations (with MongoDB persistence)
 */

const Destination = require('../models/Destination');

/**
 * @desc    Get all destinations with optional search filtering
 * @route   GET /api/destinations
 * @access  Public
 */
const getDestinations = async (req, res, next) => {
    try {
        const { search } = req.query;
        let filter = {};

        if (search) {
            const query = search.trim();
            const queryRegex = new RegExp(query, 'i');
            filter = {
                $or: [
                    { title: queryRegex },
                    { description: queryRegex },
                    { country: queryRegex }
                ]
            };
        }

        const destinations = await Destination.find(filter);

        res.status(200).json({
            success: true,
            message: search 
                ? `Found ${destinations.length} destinations matching "${search}"`
                : "Destinations retrieved successfully",
            data: destinations
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get a single destination by ID
 * @route   GET /api/destinations/:id
 * @access  Public
 */
const getDestinationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const destination = await Destination.findById(id);

        if (!destination) {
            return res.status(404).json({
                success: false,
                message: `Destination with ID "${id}" not found`,
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: "Destination retrieved successfully",
            data: destination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new destination
 * @route   POST /api/destinations (Public/Admin)
 * @access  Private/Public
 */
const createDestination = async (req, res, next) => {
    try {
        const { name, title, price, rating, desc, description, id, img, image, country } = req.body;

        const resolvedTitle = title || name;
        const resolvedPrice = price;
        const resolvedId = id ? id.trim().toLowerCase() : undefined;

        if (!resolvedTitle) {
            return res.status(400).json({
                success: false,
                message: "Destination title/name is required",
                data: null
            });
        }

        if (!resolvedPrice) {
            return res.status(400).json({
                success: false,
                message: "Destination price is required",
                data: null
            });
        }

        // Check if custom ID already exists
        if (resolvedId) {
            const existing = await Destination.findById(resolvedId);
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: `Destination with ID "${resolvedId}" already exists`,
                    data: null
                });
            }
        }

        const newDest = new Destination({
            _id: resolvedId,
            title: resolvedTitle.trim(),
            price: String(resolvedPrice).trim(),
            rating: rating ? String(rating).trim() : "4.5",
            description: (description || desc || "").trim(),
            image: (image || img || "").trim(),
            country: (country || "India").trim()
        });

        await newDest.save();

        res.status(201).json({
            success: true,
            message: "Destination created successfully",
            data: newDest
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a destination
 * @route   PUT /api/destinations/:id
 * @access  Private/Public
 */
const updateDestination = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, title, price, rating, desc, description, img, image, country } = req.body;

        const dest = await Destination.findById(id);

        if (!dest) {
            return res.status(404).json({
                success: false,
                message: `Destination with ID "${id}" not found`,
                data: null
            });
        }

        // Support both old naming style and new naming style
        if (title !== undefined) dest.title = title.trim();
        else if (name !== undefined) dest.title = name.trim();

        if (price !== undefined) dest.price = String(price).trim();
        if (rating !== undefined) dest.rating = String(rating).trim();

        if (description !== undefined) dest.description = description.trim();
        else if (desc !== undefined) dest.description = desc.trim();

        if (image !== undefined) dest.image = image.trim();
        else if (img !== undefined) dest.image = img.trim();

        if (country !== undefined) dest.country = country.trim();

        await dest.save();

        res.status(200).json({
            success: true,
            message: "Destination updated successfully",
            data: dest
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a destination
 * @route   DELETE /api/destinations/:id
 * @access  Private/Public
 */
const deleteDestination = async (req, res, next) => {
    try {
        const { id } = req.params;
        const dest = await Destination.findById(id);

        if (!dest) {
            return res.status(404).json({
                success: false,
                message: `Destination with ID "${id}" not found`,
                data: null
            });
        }

        await Destination.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: `Destination "${id}" deleted successfully`,
            data: null
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDestinations,
    getDestinationById,
    createDestination,
    updateDestination,
    deleteDestination
};
