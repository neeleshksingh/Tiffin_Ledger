const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    shopName: { type: String, required: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    amountPerDay: { type: Number, required: true },
    gstNumber: { type: String, required: true },
    billingInfo: {
        name: { type: String, required: true },
        gstin: { type: String, required: true },
        address: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now },
});

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;