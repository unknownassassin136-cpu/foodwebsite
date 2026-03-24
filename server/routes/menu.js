const express = require('express');
const MenuItem = require('../models/MenuItem');

const router = express.Router();

/**
 * GET /api/menu
 * List menu items with optional filters:
 *   ?category=<categoryId>  — filter by category
 *   ?search=<query>         — text search name/description
 *   ?vegetarian=true        — only vegetarian items
 *   ?available=true         — only available items (default: true)
 *   ?sort=price_asc|price_desc|rating|newest
 *   ?page=1&limit=20        — pagination
 */
router.get('/', async (req, res, next) => {
    try {
        const { category, search, vegetarian, available, sort, page = 1, limit = 50 } = req.query;

        const filter = {};

        if (category) filter.category = category;
        if (vegetarian === 'true') filter.isVegetarian = true;
        if (available !== 'false') filter.isAvailable = true;

        // Text search
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Sorting
        let sortObj = { createdAt: -1 };
        if (sort === 'price_asc') sortObj = { price: 1 };
        else if (sort === 'price_desc') sortObj = { price: -1 };
        else if (sort === 'rating') sortObj = { rating: -1 };
        else if (sort === 'newest') sortObj = { createdAt: -1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [items, total] = await Promise.all([
            MenuItem.find(filter).populate('category', 'name slug').sort(sortObj).skip(skip).limit(parseInt(limit)),
            MenuItem.countDocuments(filter)
        ]);

        res.json({
            items,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            total
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/menu/:id
 * Get a single menu item by ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const item = await MenuItem.findById(req.params.id).populate('category', 'name slug');
        if (!item) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json(item);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
