const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Socket.io authentication middleware.
 * Verifies JWT passed in handshake auth and attaches user to socket.
 */
const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new Error('User not found'));
        }

        // Attach user info to socket for use in event handlers
        socket.userId = user._id.toString();
        socket.userName = user.name;
        socket.userRole = user.role;

        next();
    } catch (error) {
        next(new Error('Invalid token'));
    }
};

module.exports = socketAuth;
