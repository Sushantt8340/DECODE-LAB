const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    _id: { 
        type: String,
        default: () => `nt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    },
    userId: { type: String, ref: 'User', default: null },
    email: { type: String, required: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ['success', 'info', 'warning', 'error'], default: 'info' },
    read: { type: Boolean, default: false }
}, {
    timestamps: true
});

notificationSchema.virtual('id').get(function() {
    return this._id;
});

notificationSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        ret.id = ret._id;
        return ret;
    }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
