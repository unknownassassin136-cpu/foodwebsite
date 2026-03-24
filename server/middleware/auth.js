const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: Verify JWT token and attach user to req.user
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized — no token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized — user not found' });
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized — invalid token' });
    }
};

/**
 * Middleware: Restrict route to admin users only. Must be used after protect.
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied — admin only' });
};

module.exports = { protect, adminOnly };
