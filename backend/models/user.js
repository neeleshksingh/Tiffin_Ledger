const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        messId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
        preferredMealTypes: {
            type: [String],
            default: []
        },
        address: {
            line1: { type: String },
            line2: { type: String },
            city: { type: String },
            state: { type: String },
            zipCode: { type: String },
        },
        contact: {
            phone: { type: String },
            alternatePhone: { type: String },
        },
        profilePic: { type: String },
        blockedByVendors: [
            {
                vendorId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Vendor',
                    required: true
                },
                blockedAt: {
                    type: Date,
                    default: Date.now
                },
                reason: {
                    type: String,
                    default: 'No reason provided'
                },
                isBlocked: {
                    type: Boolean,
                    default: true
                }
            }
        ]
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;