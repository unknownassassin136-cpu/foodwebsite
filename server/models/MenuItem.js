const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: 1000
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    image: {
        type: String,
        default: ''
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    tags: [{
        type: String,
        trim: true
    }],
    isVegetarian: {
        type: Boolean,
        default: false
    },
    isSpicy: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 4.0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    preparationTime: {
        type: Number,                     // Minutes
        default: 20
    },
    calories: {
        type: Number,
        default: null
    }
}, {
    timestamps: true
});

// Index for search
menuItemSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
