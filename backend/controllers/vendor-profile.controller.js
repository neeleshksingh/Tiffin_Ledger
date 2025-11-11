const Vendor = require('../models/vendor');
const VendorUser = require('../models/vendor-user');
const Meal = require('../models/meal');
const User = require('../models/user');
const PaidTracking = require('../models/paid-tracking');
const TiffinTracking = require('../models/tiffin-tracking');

// @desc    Get logged-in vendor's profile + totalRevenue
// @route   GET /api/vendors/profile
// @access  Private (Vendor)
const getVendorProfile = async (req, res) => {
    try {
        const vendorId = req.vendorUser.vendorId._id;
        const amountPerDay = req.vendorUser.vendorId.amountPerDay;

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);

        const meals = await Meal.find({
            vendorId,
            date: { $gte: today, $lte: nextWeek }
        }).sort({ date: 1 });

        const formattedMeals = meals.map(meal => ({
            _id: meal._id,
            date: meal.date,
            formattedDate: meal.date.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            day: meal.date.toLocaleDateString('en-IN', { weekday: 'long' }),
            mealDetails: meal.mealDetails
        }));

        // === CALCULATE TOTAL REVENUE ===
        let totalRevenue = 0;

        const paidTrackings = await PaidTracking.find({ vendorId });

        for (const tracking of paidTrackings) {
            for (const [mealType, daysMap] of tracking.days.entries()) {
                for (const [day, isPaid] of daysMap.entries()) {
                    if (isPaid === true) {
                        totalRevenue += amountPerDay;
                    }
                }
            }
        }
        // === END REVENUE CALCULATION ===

        res.status(200).json({
            user: {
                id: req.vendorUser._id,
                username: req.vendorUser.username,
                vendor: vendor
            },
            meals: formattedMeals,
            stats: {
                totalMeals: meals.length,
                hasTodayMeal: meals.some(m =>
                    m.date.toDateString() === new Date().toDateString()
                )
            },
            totalRevenue
        });
    } catch (err) {
        console.error("Error in getVendorProfile:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update vendor's profile (updates Vendor document)
// @route   PUT /api/vendors/profile
// @access  Private (Vendor)
const updateVendorProfile = async (req, res) => {
    try {
        const updates = req.body;

        if (updates.availableMealTypes && (!Array.isArray(updates.availableMealTypes) || updates.availableMealTypes.some((type) => typeof type !== 'string'))) {
            return res.status(400).json({ message: 'availableMealTypes must be an array of strings' });
        }

        const updatedVendor = await Vendor.findByIdAndUpdate(req.vendorUser.vendorId._id, updates, { new: true });

        if (!updatedVendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.status(200).json({
            message: 'Vendor profile updated successfully',
            vendor: updatedVendor
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete vendor's profile (deletes Vendor and VendorUser)
// @route   DELETE /api/vendors/profile
// @access  Private (Vendor)
const deleteVendorProfile = async (req, res) => {
    try {
        const assignedUsers = await User.countDocuments({ messId: req.vendorUser.vendorId._id });
        if (assignedUsers > 0) {
            return res.status(400).json({ message: 'Cannot delete vendor with assigned users. Reassign first.' });
        }

        await Vendor.findByIdAndDelete(req.vendorUser.vendorId._id);

        await VendorUser.findByIdAndDelete(req.vendorUser._id);

        res.status(200).json({ message: 'Vendor profile deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all users assigned to the logged-in vendor with their meal preferences
// @route   GET /api/vendors/users
// @access  Private (Vendor)
const getAssignedUsers = async (req, res) => {
    try {
        const vendorId = req.vendorUser.vendorId._id;

        const users = await User.find({ messId: vendorId })
            .select('-password')
            .sort({ createdAt: -1 });

        await User.populate(users, { path: 'messId', select: 'shopName name' });

        const formattedUsers = users.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.contact?.phone || null,
            alternatePhone: user.contact?.alternatePhone || null,
            address: user.address,
            profilePic: user.profilePic,
            preferredMealTypes: user.preferredMealTypes || [],
            vendor: user.messId ? {
                id: user.messId._id,
                name: user.messId.name,
                shopName: user.messId.shopName
            } : null,
            joinedAt: user.createdAt,
            blockedByVendor: user.blockedByVendors.some(b => b.vendorId.toString() === vendorId.toString() && b.isBlocked)
        }));

        res.status(200).json({
            success: true,
            count: formattedUsers.length,
            vendorMealTypes: req.vendorUser.vendorId.availableMealTypes,
            users: formattedUsers
        });

    } catch (err) {
        console.error("Error in getAssignedUsers:", err);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

const getAllUsersPaymentStatus = async (req, res) => {
    try {
        const vendorId = req.vendorUser.vendorId._id;
        const amountPerDay = req.vendorUser.vendorId.amountPerDay;

        const users = await User.find({ messId: vendorId }).select('name email contact');

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const monthKey = `${year}-${month}`;

        const [tiffinTrackings, paidTrackings] = await Promise.all([
            TiffinTracking.find({ vendorId, month: monthKey }),
            PaidTracking.find({ vendorId, month: monthKey })
        ]);

        const tiffinMap = new Map(tiffinTrackings.map(t => [t.userId.toString(), t.days]));
        const paidMap = new Map(paidTrackings.map(p => [p.userId.toString(), p.days]));

        const results = users.map(user => {
            const userIdStr = user._id.toString();
            const tiffinDays = tiffinMap.get(userIdStr) || new Map();
            const paidDays = paidMap.get(userIdStr) || new Map();

            let totalDelivered = 0;
            let totalPaid = 0;

            for (const daysMap of tiffinDays.values()) {
                for (const delivered of daysMap.values()) {
                    if (delivered) totalDelivered++;
                }
            }

            for (const [mealType, daysMap] of paidDays.entries()) {
                const tiffinMapForMeal = tiffinDays.get(mealType) || new Map();
                for (const [day, isPaid] of daysMap.entries()) {
                    if (isPaid && tiffinMapForMeal.get(day) === true) {
                        totalPaid++;
                    }
                }
            }

            const totalAmount = totalDelivered * amountPerDay;
            const paidAmount = totalPaid * amountPerDay;
            const dueAmount = totalAmount - paidAmount;

            return {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.contact?.phone || null
                },
                month: monthKey,
                summary: {
                    totalDelivered,
                    totalPaid,
                    totalAmount,
                    paidAmount,
                    dueAmount
                }
            };
        });

        res.status(200).json({
            month: monthKey,
            amountPerDay,
            users: results
        });
    } catch (err) {
        console.error("Error in getAllUsersPaymentStatus:", err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getUserPaymentHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const vendorId = req.vendorUser.vendorId._id;
        const amountPerDay = req.vendorUser.vendorId.amountPerDay;

        const user = await User.findOne({ _id: userId, messId: vendorId });
        if (!user) return res.status(404).json({ message: 'User not assigned' });

        const months = await TiffinTracking.distinct('month', { userId, vendorId });
        const paidMonths = await PaidTracking.distinct('month', { userId, vendorId });
        const allMonths = [...new Set([...months, ...paidMonths])].sort();

        const history = [];

        for (const monthKey of allMonths) {
            const [tiffin, paid] = await Promise.all([
                TiffinTracking.findOne({ userId, vendorId, month: monthKey }),
                PaidTracking.findOne({ userId, vendorId, month: monthKey })
            ]);

            let totalDelivered = 0;
            let totalPaid = 0;

            const tiffinDays = tiffin?.days || new Map();
            const paidDays = paid?.days || new Map();

            for (const daysMap of tiffinDays.values()) {
                for (const delivered of daysMap.values()) {
                    if (delivered) totalDelivered++;
                }
            }

            for (const [meal, daysMap] of paidDays.entries()) {
                const tiffinMap = tiffinDays.get(meal) || new Map();
                for (const [day, isPaid] of daysMap.entries()) {
                    if (isPaid && tiffinMap.get(day) === true) totalPaid++;
                }
            }

            const totalAmount = totalDelivered * amountPerDay;
            const paidAmount = totalPaid * amountPerDay;
            const dueAmount = totalAmount - paidAmount;

            history.push({
                month: monthKey,
                totalDelivered,
                totalPaid,
                totalAmount,
                paidAmount,
                dueAmount
            });
        }

        res.json({ name: user.name, history });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getVendorProfile,
    updateVendorProfile,
    deleteVendorProfile,
    getAssignedUsers,
    getAllUsersPaymentStatus,
    getUserPaymentHistory
};