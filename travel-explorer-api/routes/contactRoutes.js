const express = require('express');
const router = express.Router();
const { submitContact } = require('../controllers/contactController');
const { validateContact } = require('../middleware/validator');

// POST /api/contact - Submit a contact message (with validation)
router.post('/', validateContact, submitContact);

module.exports = router;
