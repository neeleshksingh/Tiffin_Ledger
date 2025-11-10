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

exports.addOrUpdateProfile = async (req, res) => {
    const { error, value } = profileSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    try {
        const user = await User.findByIdAndUpdate(
            value.userId,
            { $set: value },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).select('-password');

        try {
            await redisClient.del(getCacheKey(value.userId));
        } catch (cacheErr) {
            console.warn('Redis cache invalidation failed:', cacheErr.message);
        }

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
        let cached = null;
        try {
            cached = await redisClient.get(getCacheKey(userId));
        } catch (cacheErr) {
            console.warn('Redis unavailable, skipping cache:', cacheErr.message);
        }

        if (cached) {
            return res.status(200).json({
                message: 'Profile fetched (from cache)',
                data: JSON.parse(cached),
                cached: true
            });
        }

        const user = await User.findById(userId)
            .select('-password -blockedByVendors')
            .populate('messId', 'shopName address amountPerDay gstNumber');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const vendorId = user.messId?._id;

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const recentMonths = await TiffinTracking.find({
            userId,
            vendorId,
            month: { $gte: threeMonthsAgo.toISOString().slice(0, 7) }
        }).sort({ month: -1 });

        const tiffinOverview = recentMonths.map(tracking => {
            let totalMeals = 0;
            const takenDays = [];

            for (const [day, meals] of tracking.days.entries()) {
                const count = Array.from(meals.values()).filter(Boolean).length;
                if (count > 0) {
                    totalMeals += count;
                    takenDays.push(day);
                }
            }

            return {
                month: tracking.month,
                totalDays: tracking.days.size,
                takenDays: takenDays.length,
                totalMeals,
            };
        });

        const response = {
            user,
            vendor: user.messId,
            tiffinOverview,
            lastUpdated: new Date()
        };

        try {
            await redisClient.setEx(getCacheKey(userId), 300, JSON.stringify(response));
        } catch (cacheErr) {
            console.warn('Failed to cache profile:', cacheErr.message);
        }

        res.status(200).json({
            message: 'Profile fetched successfully',
            data: response
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
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

        try {
            await redisClient.del(getCacheKey(userId));
        } catch (cacheErr) {
            console.warn('Redis cleanup failed:', cacheErr.message);
        }

        res.status(200).json({ message: 'Profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};