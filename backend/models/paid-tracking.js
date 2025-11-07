const mongoose = require('mongoose');

const paidTrackingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    month: { type: String, required: true },
    days: {
        type: Map,
        of: {
            type: Map,
            of: Boolean,
        },
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('PaidTracking', paidTrackingSchema);