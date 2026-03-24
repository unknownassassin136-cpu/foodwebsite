const express = require('express');
const Category = require('../models/Category');

const router = express.Router();

/**
 * GET /api/categories
 * List all categories, ordered by displayOrder
 */
router.get('/', async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ displayOrder: 1 });
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
