const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper: return validation errors
const handleValidation = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ message: errors.array()[0].msg });
        return false;
    }
    return true;
};

/**
 * POST /api/auth/register
 * Create a new user account
 */
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res, next) => {
    try {
        if (!handleValidation(req, res)) return;

        const { name, email, password, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists' });
        }

        const user = await User.create({ name, email, password, phone });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            addresses: user.addresses,
            token: generateToken(user._id)
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/login
 * Log in and return JWT
 */
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res, next) => {
    try {
        if (!handleValidation(req, res)) return;

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            addresses: user.addresses,
            token: generateToken(user._id)
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/me
 * Get current user profile (requires auth)
 */
router.get('/me', protect, async (req, res) => {
    res.json({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        addresses: req.user.addresses
    });
});

/**
 * PUT /api/auth/profile
 * Update user profile (requires auth)
 */
router.put('/profile', protect, async (req, res, next) => {
    try {
        const user = req.user;
        const { name, phone, addresses } = req.body;

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (addresses) user.addresses = addresses;

        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            addresses: user.addresses
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
