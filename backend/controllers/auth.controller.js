const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const jwt_token = process.env.JWT_SECRET;
exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user.', error: error.message });
    }
};

// Signin Controller
exports.signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            jwt_token,
            { expiresIn: '31d' }
        );

        res.status(200).json({ message: 'Signin successful.', token, user });
    } catch (error) {
        res.status(500).json({ message: 'Error signing in.', error: error.message });
    }
};

exports.logoutController = async (req, res) => {
    try {
        // Optional: You can maintain a blacklist of invalid tokens on the server
        const token = req.headers.authorization?.split(' ')[1];
        await blacklistToken(token);

        return res.status(200).json({
            success: true,
            message: 'Logged out successfully',
            data: null
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error during logout',
            error: error.message
        });
    }
};
