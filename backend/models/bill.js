const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    invoiceNumber: { type: String, required: true },
    date: { type: Date, required: true },
    items: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            amount: { type: Number, required: true },
        },
    ],
    totalAmount: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    payableAmount: { type: Number, required: true },
    billingInfo: {
        name: { type: String, required: true },
        gstin: { type: String, required: true },
        address: { type: String, required: true },
    },
    shippingInfo: {
        name: { type: String, required: true },
        gstin: { type: String, required: true },
        address: { type: String, required: true },
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Bill', billSchema);