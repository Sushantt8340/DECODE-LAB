const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    _id: { 
        type: String,
        default: () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    message: { type: String, required: true, trim: true }
}, {
    timestamps: true
});

contactSchema.virtual('id').get(function() {
    return this._id;
});

contactSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function(doc, ret) {
        ret.id = ret._id;
        return ret;
    }
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
