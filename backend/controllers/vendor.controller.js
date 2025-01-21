const Vendor = require('../models/vendor');
const User = require('../models/user');

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
        const { userId, messId } = req.body;

        const vendor = await Vendor.findById(messId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.messId = messId;
        await user.save();

        res.status(200).json({ message: 'Vendor assigned successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

const createVendor = async (req, res) => {
    try {
        const { name, shopName, address, contactNumber, amountPerDay, gstNumber, billingInfo } = req.body;

        if (!name || !shopName || !address || !contactNumber || !amountPerDay || !gstNumber || !billingInfo) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const newVendor = new Vendor({
            name,
            shopName,
            address,
            contactNumber,
            amountPerDay,
            gstNumber,
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

        const result = await Vendor.deleteMany({ _id: { $in: ids } });
        res.status(200).json({ message: 'Vendors deleted successfully', deletedCount: result.deletedCount });
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
    deleteMultipleVendors
};
