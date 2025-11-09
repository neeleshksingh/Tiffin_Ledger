const PaidTracking = require('../models/paid-tracking');
const TiffinTracking = require('../models/tiffin-tracking');
const User = require('../models/user');
const Vendor = require('../models/vendor');

// @desc    Get complete revenue analytics for logged-in vendor
// @route   GET /api/vendors/revenue-stats
// @access  Private (Vendor)
const getRevenueStats = async (req, res) => {
    try {
        const vendorId = req.vendorUser.vendorId._id;
        const amountPerDay = req.vendorUser.vendorId.amountPerDay || 0;

        if (!amountPerDay) {
            return res.status(400).json({ message: 'Vendor amountPerDay not set' });
        }

        const [paidTrackings, tiffinTrackings, users] = await Promise.all([
            PaidTracking.find({ vendorId }),
            TiffinTracking.find({ vendorId }),
            User.find({ messId: vendorId }).select('name contact.phone profilePic')
        ]);

        const userMap = new Map();
        users.forEach(u => {
            userMap.set(u._id.toString(), {
                name: u.name,
                phone: u.contact?.phone || '',
                profilePic: u.profilePic
            });
        });

        let totalRevenue = 0;
        let paidDaysCount = 0;
        let pendingDaysCount = 0;
        const monthlyMap = new Map();
        const recentPayments = [];

        for (const pt of paidTrackings) {
            const monthKey = pt.month;
            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, { revenue: 0, paidDays: 0, pendingDays: 0 });
            }

            for (const [mealType, daysMap] of pt.days.entries()) {
                for (const [day, isPaid] of daysMap.entries()) {
                    if (isPaid) {
                        totalRevenue += amountPerDay;
                        paidDaysCount++;
                        monthlyMap.get(monthKey).revenue += amountPerDay;
                        monthlyMap.get(monthKey).paidDays++;

                        const userInfo = userMap.get(pt.userId.toString()) || { name: 'Unknown', phone: '' };
                        recentPayments.push({
                            userId: pt.userId,
                            userName: userInfo.name,
                            phone: userInfo.phone,
                            profilePic: userInfo.profilePic,
                            amount: amountPerDay,
                            month: monthKey,
                            paidAt: pt.updatedAt || pt.createdAt
                        });
                    }
                }
            }
        }

        for (const tt of tiffinTrackings) {
            const monthKey = tt.month;
            if (!monthlyMap.has(monthKey)) {
                monthlyMap.set(monthKey, { revenue: 0, paidDays: 0, pendingDays: 0 });
            }

            for (const [mealType, daysMap] of tt.days.entries()) {
                for (const [day, delivered] of daysMap.entries()) {
                    if (!delivered) continue;

                    const paidRecord = paidTrackings.find(p =>
                        p.userId.toString() === tt.userId.toString() && p.month === tt.month
                    );
                    const isPaid = paidRecord?.days.get(mealType)?.get(day);

                    if (!isPaid) {
                        pendingDaysCount++;
                        monthlyMap.get(monthKey).pendingDays++;
                    }
                }
            }
        }

        const totalPending = pendingDaysCount * amountPerDay;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const next30 = new Date(today);
        next30.setDate(today.getDate() + 30);

        let projectedRevenue = 0;
        const futureTiffins = await TiffinTracking.find({
            vendorId,
            month: { $gte: today.toISOString().slice(0, 7) }
        });

        for (const ft of futureTiffins) {
            const monthDate = new Date(ft.month + '-01');
            if (monthDate > next30) continue;

            for (const daysMap of ft.days.values()) {
                for (const delivered of daysMap.values()) {
                    if (delivered) projectedRevenue += amountPerDay;
                }
            }
        }

        const monthlyBreakdown = Array.from(monthlyMap.entries())
            .map(([month, data]) => ({
                month: new Date(month + '-01').toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric'
                }),
                revenue: data.revenue,
                pending: data.pendingDays * amountPerDay,
                paidDays: data.paidDays,
                pendingDays: data.pendingDays
            }))
            .sort((a, b) => new Date(b.month) - new Date(a.month));

        recentPayments.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalRevenue,
                    totalPending,
                    totalProjected: projectedRevenue,
                    collectionRate: (paidDaysCount + pendingDaysCount) > 0
                        ? Math.round((paidDaysCount / (paidDaysCount + pendingDaysCount)) * 100)
                        : 0,
                    totalDeliveredDays: paidDaysCount + pendingDaysCount
                },
                monthlyBreakdown,
                recentPayments: recentPayments.slice(0, 15).map(p => ({
                    user: {
                        _id: p.userId,
                        name: p.userName,
                        phone: p.phone,
                        profilePic: p.profilePic
                    },
                    amount: p.amount,
                    month: new Date(p.month + '-01').toLocaleDateString('en-IN', {
                        month: 'long',
                        year: 'numeric'
                    }),
                    paidAt: p.paidAt
                }))
            }
        });

    } catch (err) {
        console.error("Error in getRevenueStats:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = { getRevenueStats };