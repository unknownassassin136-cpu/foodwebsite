/**
 * Centralized error handler middleware.
 * Catches all errors passed via next(error) and returns consistent JSON.
 */
const errorHandler = (err, req, res, _next) => {
    console.error('Error:', err.message);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: 'Validation error', errors: messages });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({ message: `Duplicate value for "${field}"` });
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Default
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        message: err.message || 'Internal server error'
    });
};

module.exports = errorHandler;
