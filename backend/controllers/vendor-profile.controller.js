const Vendor = require('../models/vendor');
const VendorUser = require('../models/vendor-user');
const Meal = require('../models/meal');

// @desc    Get logged-in vendor's profile
// @route   GET /api/vendors/profile
// @access  Private (Vendor)
const getVendorProfile = async (req, res) => {
    try {
        const vendorId = req.vendorUser.vendorId._id;

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
            }
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

module.exports = {
    getVendorProfile,
    updateVendorProfile,
    deleteVendorProfile
};