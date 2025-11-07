const Vendor = require('../models/vendor');
const VendorUser = require('../models/vendor-user');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Vendor user signup (link credentials to existing vendor)
// @route   POST /api/vendors/auth/signup
// @access  Public
const signupVendorUser = async (req, res) => {
    try {
        const { vendorId, username, password } = req.body;

        if (!vendorId || !username || !password) {
            return res.status(400).json({ message: 'Vendor ID, username, and password are required' });
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const existingUsername = await VendorUser.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const existingUser = await VendorUser.findOne({ vendorId: vendor._id });
        if (existingUser) {
            return res.status(400).json({ message: 'Vendor already has an associated user account' });
        }

        const vendorUser = new VendorUser({
            vendorId: vendor._id,
            username,
            password 
        });

        await vendorUser.save();

        const token = generateToken(vendorUser._id);

        res.status(201).json({
            message: 'Vendor user created successfully',
            token,
            user: {
                id: vendorUser._id,
                username: vendorUser.username,
                vendor: vendor
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Vendor user login
// @route   POST /api/vendors/auth/login
// @access  Public
const loginVendorUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const vendorUser = await VendorUser.findOne({ username }).populate('vendorId');
        if (!vendorUser) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await vendorUser.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = generateToken(vendorUser._id);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: vendorUser._id,
                username: vendorUser.username,
                vendor: vendorUser.vendorId
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};



module.exports = {
    signupVendorUser,
    loginVendorUser
};