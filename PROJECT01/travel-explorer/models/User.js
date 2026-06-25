const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    _id: { 
        type: String, 
        default: () => `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    },
    name: { 
        type: String, 
        required: [true, 'Name is required'], 
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    phone: { 
        type: String, 
        trim: true,
        default: ''
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'] 
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    wishlist: { 
        type: [String], 
        default: [] 
    }
}, {
    timestamps: true
});

// Configure virtual id
userSchema.virtual('id').get(function() {
    return this._id;
});

userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        ret.id = ret._id;
        return ret;
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
