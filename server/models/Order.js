const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: [arr => arr.length > 0, 'Order must have at least one item']
    },
    deliveryAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true }
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi'],
        default: 'cash'
    },
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['placed', 'confirmed', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'],
        default: 'placed'
    },
    estimatedDelivery: {
        type: Date,
        default: null
    },
    notes: {
        type: String,
        default: '',
        maxlength: 500
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
