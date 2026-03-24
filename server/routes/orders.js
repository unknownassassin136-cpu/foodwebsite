const express = require('express');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(protect);

/**
 * POST /api/orders
 * Place a new order
 */
router.post('/', async (req, res, next) => {
    try {
        const { items, deliveryAddress, paymentMethod, notes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must contain at least one item' });
        }
        if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city) {
            return res.status(400).json({ message: 'Delivery address is required' });
        }

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const tax = Math.round(subtotal * 0.08 * 100) / 100;          // 8% tax
        const deliveryFee = subtotal >= 30 ? 0 : 4.99;                 // Free delivery over $30
        const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

        // Estimated delivery: 30-45 minutes from now
        const estimatedDelivery = new Date(Date.now() + 40 * 60 * 1000);

        const order = await Order.create({
            user: req.user._id,
            items,
            deliveryAddress,
            paymentMethod: paymentMethod || 'cash',
            subtotal,
            tax,
            deliveryFee,
            total,
            estimatedDelivery,
            notes: notes || ''
        });

        // ─── Emit real-time new order notification to admins ───
        const io = req.app.get('io');
        if (io) {
            io.to('admin').emit('order:new', {
                order: { ...order.toObject(), userName: req.user.name }
            });
        }

        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/orders
 * Get current user's order history
 */
router.get('/', async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/orders/:id
 * Get a single order by ID (must belong to user)
 */
router.get('/:id', async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // Ensure order belongs to user (or user is admin)
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }
        res.json(order);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
