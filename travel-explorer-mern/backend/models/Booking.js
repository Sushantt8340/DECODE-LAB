const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    _id: { 
        type: String,
        default: () => `bk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    },
    userId: { 
        type: String, 
        ref: 'User', 
        required: [true, 'User ID is required'] 
    },
    destinationId: { 
        type: String, 
        ref: 'Destination', 
        required: [true, 'Destination ID is required'] 
    },
    travelDate: { 
        type: String, 
        required: [true, 'Travel date is required'] 
    },
    persons: { 
        type: Number,
        default: 1
    },
    bookingStatus: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending' 
    },
    
    // Support fields for frontend compatibility
    fullName: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    destination: { type: String, trim: true }, // Destination name (e.g. "Taj Mahal, Agra")
    adults: { type: Number, default: 1 },
    kids: { type: Number, default: 0 },
    packageType: { type: String, default: 'Standard' },
    totalPrice: { type: Number, default: 0 },
    paymentOption: { type: String, default: 'pay_online' },
    paymentStatus: { type: String, default: 'pending' },
    razorpayPaymentId: { type: String, default: null }
}, {
    timestamps: true
});

// Configure virtual id
bookingSchema.virtual('id').get(function() {
    return this._id;
});

bookingSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        ret.id = ret._id;
        return ret;
    }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
