const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
    _id: { 
        type: String,
        default: () => `dest_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    },
    title: { 
        type: String, 
        required: [true, 'Title is required'], 
        trim: true 
    },
    country: { 
        type: String, 
        trim: true,
        default: 'India' 
    },
    description: { 
        type: String, 
        trim: true,
        default: ''
    },
    image: { 
        type: String, 
        trim: true,
        default: ''
    },
    price: { 
        type: String, 
        required: [true, 'Price is required'], 
        trim: true 
    },
    rating: { 
        type: String, 
        trim: true,
        default: '4.5' 
    }
}, {
    timestamps: true
});

// Configure virtual fields to map title/description/image to name/desc/img for frontend compatibility
destinationSchema.virtual('name').get(function() {
    return this.title;
}).set(function(val) {
    this.title = val;
});

destinationSchema.virtual('desc').get(function() {
    return this.description;
}).set(function(val) {
    this.description = val;
});

destinationSchema.virtual('img').get(function() {
    return this.image;
}).set(function(val) {
    this.image = val;
});

destinationSchema.virtual('id').get(function() {
    return this._id;
});

destinationSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        ret.id = ret._id;
        ret.name = ret.title;
        ret.desc = ret.description;
        ret.img = ret.image;
        return ret;
    }
});

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination;
