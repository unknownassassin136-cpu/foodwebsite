const express = require('express');
const MenuItem = require('../models/MenuItem');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// ─── Dashboard Stats ───────────────────────────────────────────
/**
 * GET /api/admin/stats
 * Dashboard summary stats
 */
router.get('/stats', async (req, res, next) => {
    try {
        const [totalOrders, totalRevenue, totalUsers, totalItems, recentOrders, statusCounts] = await Promise.all([
            Order.countDocuments(),
            Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
            User.countDocuments({ role: 'user' }),
            MenuItem.countDocuments(),
            Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
            Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
        ]);

        res.json({
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalUsers,
            totalItems,
            recentOrders,
            statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {})
        });
    } catch (error) {
        next(error);
    }
});

// ─── Menu Item CRUD ────────────────────────────────────────────
/**
 * GET /api/admin/menu  — all items (including unavailable)
 */
router.get('/menu', async (req, res, next) => {
    try {
        const items = await MenuItem.find().populate('category', 'name slug').sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/admin/menu  — create menu item
 */
router.post('/menu', async (req, res, next) => {
    try {
        const item = await MenuItem.create(req.body);
        const populated = await item.populate('category', 'name slug');
        res.status(201).json(populated);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/admin/menu/:id  — update menu item
 */
router.put('/menu/:id', async (req, res, next) => {
    try {
        const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('category', 'name slug');
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json(item);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/admin/menu/:id  — delete menu item
 */
router.delete('/menu/:id', async (req, res, next) => {
    try {
        const item = await MenuItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deleted' });
    } catch (error) {
        next(error);
    }
});

// ─── Category CRUD ─────────────────────────────────────────────
/**
 * POST /api/admin/categories  — create category
 */
router.post('/categories', async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/admin/categories/:id  — update category
 */
router.put('/categories/:id', async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/admin/categories/:id  — delete category
 */
router.delete('/categories/:id', async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        next(error);
    }
});

// ─── Order Management ──────────────────────────────────────────
/**
 * GET /api/admin/orders  — all orders with pagination
 */
router.get('/orders', async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [orders, total] = await Promise.all([
            Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
            Order.countDocuments(filter)
        ]);

        res.json({ orders, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), total });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/admin/orders/:id  — update order status
 */
router.put('/orders/:id', async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true })
            .populate('user', 'name email phone');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // ─── Emit real-time status update to the customer ───
        const io = req.app.get('io');
        if (io && order.user) {
            const userId = order.user._id.toString();
            io.to(`user:${userId}`).emit('order:statusUpdate', {
                orderId: order._id,
                status: order.status,
                updatedAt: new Date().toISOString()
            });
            // Also emit to anyone watching this specific order
            io.to(`order:${order._id}`).emit('order:statusUpdate', {
                orderId: order._id,
                status: order.status,
                updatedAt: new Date().toISOString()
            });
        }

        res.json(order);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
