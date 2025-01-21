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

module.exports = { getVendors, assignVendorToUser, createVendor };