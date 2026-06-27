const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    _id: { 
        type: String,
        default: () => `rev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    },
    destinationId: { type: String, ref: 'Destination', required: true },
    userId: { type: String, ref: 'User', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    photo: { type: String, default: '' }
}, {
    timestamps: true
});

reviewSchema.virtual('id').get(function() {
    return this._id;
});

reviewSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        ret.id = ret._id;
        return ret;
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
