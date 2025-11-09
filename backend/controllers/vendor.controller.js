const Vendor = require('../models/vendor');
const User = require('../models/user');
const Meal = require('../models/meal');

const getVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find();
        res.status(200).json(vendors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const assignVendorToUser = async (req, res) => {
    try {
        const { userId, messId, preferredMealTypes } = req.body;

        const vendor = await Vendor.findById(messId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (preferredMealTypes && preferredMealTypes.length > 0) {
            const invalidTypes = preferredMealTypes.filter((type) => !vendor.availableMealTypes.includes(type));
            if (invalidTypes.length > 0) {
                return res.status(400).json({
                    message: `Invalid meal types: ${invalidTypes.join(', ')}. Available: ${vendor.availableMealTypes.join(', ')}`
                });
            }
            user.preferredMealTypes = preferredMealTypes;
        } else {
            user.preferredMealTypes = vendor.availableMealTypes;
        }

        user.messId = messId;
        await user.save();

        await user.populate('messId');

        res.status(200).json({ message: 'Vendor assigned successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const createVendor = async (req, res) => {
    try {
        const { name, shopName, address, contactNumber, amountPerDay, gstNumber, billingInfo, availableMealTypes } = req.body;

        if (!name || !shopName || !address || !contactNumber || !amountPerDay || !gstNumber || !billingInfo) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (availableMealTypes && (!Array.isArray(availableMealTypes) || availableMealTypes.some((type) => typeof type !== 'string'))) {
            return res.status(400).json({ message: 'availableMealTypes must be an array of strings' });
        }

        const newVendor = new Vendor({
            name,
            shopName,
            address,
            contactNumber,
            amountPerDay,
            gstNumber,
            availableMealTypes: availableMealTypes || [],
            billingInfo,
        });

        await newVendor.save();

        res.status(201).json({ message: 'Vendor created successfully', vendor: newVendor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateVendorById = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.availableMealTypes && (!Array.isArray(updates.availableMealTypes) || updates.availableMealTypes.some((type) => typeof type !== 'string'))) {
            return res.status(400).json({ message: 'availableMealTypes must be an array of strings' });
        }

        const updatedVendor = await Vendor.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedVendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.status(200).json({ message: 'Vendor updated successfully', vendor: updatedVendor });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteVendorById = async (req, res) => {
    try {
        const { id } = req.params;

        const assignedUsers = await User.countDocuments({ messId: id });
        if (assignedUsers > 0) {
            return res.status(400).json({ message: 'Cannot delete vendor with assigned users. Reassign first.' });
        }

        const deletedVendor = await Vendor.findByIdAndDelete(id);
        if (!deletedVendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.status(200).json({ message: 'Vendor deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const addMultipleVendors = async (req, res) => {
    try {
        const vendors = req.body;

        if (!Array.isArray(vendors) || vendors.length === 0) {
            return res.status(400).json({ message: 'Invalid vendor data' });
        }

        for (const vendor of vendors) {
            if (vendor.availableMealTypes && !Array.isArray(vendor.availableMealTypes)) {
                return res.status(400).json({ message: 'Each vendor\'s availableMealTypes must be an array of strings' });
            }
        }

        const createdVendors = await Vendor.insertMany(vendors);
        res.status(201).json({ message: 'Vendors added successfully', vendors: createdVendors });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteMultipleVendors = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Invalid vendor IDs' });
        }

        const assignedUserCount = await User.countDocuments({ messId: { $in: ids } });
        if (assignedUserCount > 0) {
            return res.status(400).json({ message: 'Cannot delete vendors with assigned users. Reassign first.' });
        }

        const result = await Vendor.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ message: 'Vendors deleted successfully', deletedCount: result.deletedCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getVendorById = async (req, res) => {
    try {
        const { id } = req.params;

        const vendor = await Vendor.findById(id).populate('availableMealTypes');
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.status(200).json(vendor);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const addMeal = async (req, res) => {
    try {
        const { vendorId, date, mealDetails } = req.body;

        if (!vendorId || !date || !mealDetails) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const invalidMealTypes = Object.keys(mealDetails).filter(key => !vendor.availableMealTypes.includes(key));
        if (invalidMealTypes.length > 0) {
            return res.status(400).json({
                message: `Invalid meal types in details: ${invalidMealTypes.join(', ')}. Available: ${vendor.availableMealTypes.join(', ')}`
            });
        }

        const newMeal = new Meal({
            vendorId,
            date,
            mealDetails,
        });

        await newMeal.save();

        res.status(201).json({ message: 'Meal added successfully', meal: newMeal });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const getMealsByVendorId = async (req, res) => {
    try {
        const { vendorId } = req.params;

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const meals = await Meal.find({ vendorId });

        if (meals.length === 0) {
            return res.status(404).json({ message: 'No meals found for this vendor' });
        }

        res.status(200).json(meals);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const addMultipleMeals = async (req, res) => {
    try {
        const meals = req.body;

        if (!Array.isArray(meals) || meals.length === 0) {
            return res.status(400).json({ message: 'Invalid meal data' });
        }

        const vendorIds = [...new Set(meals.map(meal => meal.vendorId))];
        const existingVendors = await Vendor.find({ _id: { $in: vendorIds } });

        if (existingVendors.length !== vendorIds.length) {
            return res.status(404).json({ message: 'One or more vendors not found' });
        }

        for (const meal of meals) {
            const vendor = existingVendors.find(v => v._id.toString() === meal.vendorId.toString());
            if (vendor) {
                const invalidMealTypes = Object.keys(meal.mealDetails || {}).filter(key => !vendor.availableMealTypes.includes(key));
                if (invalidMealTypes.length > 0) {
                    return res.status(400).json({
                        message: `Invalid meal types for vendor ${vendor.shopName}: ${invalidMealTypes.join(', ')}`
                    });
                }
            }
        }

        const createdMeals = await Meal.insertMany(meals);
        res.status(201).json({ message: 'Meals added successfully', meals: createdMeals });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};


const updateMeal = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, mealDetails } = req.body;

        const meal = await Meal.findById(id);
        if (!meal) {
            return res.status(404).json({ message: 'Meal not found' });
        }

        if (meal.vendorId.toString() !== req.vendorUser.vendorId._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        meal.date = date || meal.date;
        meal.mealDetails = mealDetails || meal.mealDetails;

        await meal.save();

        res.status(200).json({ message: 'Meal updated successfully', meal });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const updateMultipleMeals = async (req, res) => {
    try {
        const meals = req.body;

        if (!Array.isArray(meals) || meals.length === 0) {
            return res.status(400).json({ message: 'Invalid meal data' });
        }

        const mealIds = meals.map(m => m._id).filter(Boolean);
        const existingMeals = await Meal.find({ _id: { $in: mealIds } });

        if (existingMeals.length !== mealIds.length) {
            return res.status(404).json({ message: 'One or more meals not found' });
        }

        const unauthorized = existingMeals.some(
            m => m.vendorId.toString() !== req.vendorUser.vendorId._id.toString()
        );
        if (unauthorized) {
            return res.status(403).json({ message: 'Not authorized to update these meals' });
        }

        const bulkOps = meals.map(meal => ({
            updateOne: {
                filter: { _id: meal._id },
                update: {
                    $set: {
                        date: meal.date || existingMeals.find(m => m._id.toString() === meal._id)?.date,
                        mealDetails: meal.mealDetails || existingMeals.find(m => m._id.toString() === meal._id)?.mealDetails
                    }
                }
            }
        }));

        await Meal.bulkWrite(bulkOps);

        const updatedMeals = await Meal.find({ _id: { $in: mealIds } });

        res.status(200).json({
            message: 'Meals updated successfully',
            meals: updatedMeals
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getVendors,
    assignVendorToUser,
    createVendor,
    updateVendorById,
    deleteVendorById,
    addMultipleVendors,
    deleteMultipleVendors,
    getVendorById,
    addMeal,
    getMealsByVendorId,
    addMultipleMeals,
    updateMeal,
    updateMultipleMeals
};