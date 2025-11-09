const mongoose = require('mongoose');

const revenueAnalyticsSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        unique: true
    },
    totalRevenue: { type: Number, default: 0 },
    totalPending: { type: Number, default: 0 },
    totalProjected: { type: Number, default: 0 },
    paidDaysCount: { type: Number, default: 0 },
    pendingDaysCount: { type: Number, default: 0 },
    monthlyBreakdown: [{
        month: String,
        revenue: Number,
        paidDays: Number,
        pendingDays: Number
    }],
    recentPayments: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        phone: String,
        amount: Number,
        month: String,
        paidAt: Date
    }]
}, { timestamps: true });

module.exports = mongoose.model('RevenueAnalytics', revenueAnalyticsSchema);