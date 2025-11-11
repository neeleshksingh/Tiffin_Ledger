const User = require('../models/user');
const TiffinTracking = require('../models/tiffin-tracking');
const Joi = require('joi');
const redisClient = require('../config/redis');

const profileSchema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    address: Joi.object({
        line1: Joi.string(),
        line2: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        zipCode: Joi.string().pattern(/^\d{6}$/)
    }),
    contact: Joi.object({
        phone: Joi.string().pattern(/^\d{10}$/),
        alternatePhone: Joi.string().pattern(/^\d{10}$/).allow('')
    }),
    messId: Joi.string().hex().length(24),
    profilePic: Joi.string().uri()
});

const getCacheKey = (userId) => `profile:${userId}`;

const redis = {
    async get(key) {
        try {
            if (!redisClient.isOpen) return null;
            const val = await redisClient.get(key);
            return val;
        } catch (err) {
            console.warn('Redis GET failed:', err.message);
            return null;
        }
    },

    async set(key, value, ttl = 300) {
        try {
            if (!redisClient.isOpen) return;
            await redisClient.set(key, value, { EX: ttl });
        } catch (err) {
            console.warn('Redis SET failed:', err.message);
        }
    },

    async del(key) {
        try {
            if (!redisClient.isOpen) return;
            await redisClient.del(key);
        } catch (err) {
            console.warn('Redis DEL failed:', err.message);
        }
    }
};

exports.addOrUpdateProfile = async (req, res) => {
    const { error, value } = profileSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const user = await User.findByIdAndUpdate(
            value.userId,
            { $set: value },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).select('-password');

        await redis.del(getCacheKey(value.userId));

        res.status(200).json({
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProfileById = async (req, res) => {
    const { userId } = req.params;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        let responseData;
        const cached = await redis.get(getCacheKey(userId));

        if (cached) {
            try {
                responseData = JSON.parse(cached);
            } catch (e) {
                console.warn('Cache corrupted, ignoring:', e.message);
            }
        }

        if (!responseData) {
            const user = await User.findById(userId)
                .select('-password -blockedByVendors')
                .populate('messId', 'shopName address amountPerDay gstNumber');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            const vendorId = user.messId?._id;

            const allMonths = await TiffinTracking.find({
                userId,
                vendorId
            }).sort({ month: 1 });

            const tiffinOverview = allMonths.map(tracking => {
                const [year, month] = tracking.month.split('-').map(Number);
                const totalDaysInMonth = new Date(year, month, 0).getDate();
                const daysArray = [];

                for (let d = 1; d <= totalDaysInMonth; d++) {
                    const dayStr = d.toString().padStart(2, '0');
                    const mealsMap = tracking.days.get(dayStr) || new Map();

                    const meals = { breakfast: false, lunch: false, dinner: false };
                    for (const [meal, taken] of mealsMap.entries()) {
                        if (meal in meals) meals[meal] = taken;
                    }

                    daysArray.push({ date: dayStr, meals });
                }

                const totalMeals = daysArray.reduce((sum, day) =>
                    sum + Object.values(day.meals).filter(Boolean).length, 0
                );

                return {
                    month: tracking.month,
                    totalDays: totalDaysInMonth,
                    totalMeals,
                    tiffinTakenDays: totalMeals,
                    days: daysArray
                };
            });

            responseData = {
                user,
                vendor: user.messId,
                tiffinOverview
            };

            await redis.set(getCacheKey(userId), JSON.stringify(responseData), 300);
        }

        res.status(200).json({
            message: 'User profile fetched successfully',
            data: responseData
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Error fetching profile', error });
    }
};

exports.deleteProfile = async (req, res) => {
    const { userId } = req.params;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await TiffinTracking.deleteMany({ userId });
        await redis.del(getCacheKey(userId));

        res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};