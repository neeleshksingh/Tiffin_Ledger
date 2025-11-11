const mongoose = require('mongoose');
const PaidTracking = require('../models/paid-tracking');
const TiffinTracking = require('../models/tiffin-tracking');
const User = require('../models/user');

const flattenDaysForResponse = (daysMap) => {
    return Object.fromEntries(
        Array.from(daysMap.entries()).map(([day, meals]) => [
            day,
            Object.fromEntries(Array.from(meals.entries()))
        ])
    );
};

exports.getEligiblePaidDays = async (req, res) => {
    const { userId, month } = req.query;

    if (!userId || !month) {
        return res.status(400).json({ message: 'userId and month are required' });
    }

    let parsedUserId;
    try { parsedUserId = new mongoose.Types.ObjectId(userId); }
    catch { return res.status(400).json({ message: 'Invalid userId' }); }

    try {
        const user = await User.findById(parsedUserId).select('messId');
        if (!user?.messId) return res.status(400).json({ message: 'No vendor assigned' });

        const vendorId = user.messId;

        const tiffin = await TiffinTracking.findOne({ userId: parsedUserId, vendorId, month });
        if (!tiffin) return res.status(200).json({ data: [] });

        const eligible = [];
        for (const [dayKey, mealsMap] of tiffin.days.entries()) {
            const taken = Array.from(mealsMap.entries()).some(([_, v]) => v);
            if (taken) eligible.push(dayKey);
        }

        eligible.sort((a, b) => parseInt(a) - parseInt(b));

        res.status(200).json({ data: eligible });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markPaidSelectedDays = async (req, res) => {
    const { userId, month, selectedDays } = req.body;

    if (!userId || !month || !Array.isArray(selectedDays) || selectedDays.length === 0) {
        return res.status(400).json({ message: 'userId, month, and selectedDays[] required' });
    }

    let parsedUserId;
    try { parsedUserId = new mongoose.Types.ObjectId(userId); }
    catch { return res.status(400).json({ message: 'Invalid userId' }); }

    try {
        const user = await User.findById(parsedUserId).select('messId');
        if (!user?.messId) return res.status(400).json({ message: 'No vendor assigned' });

        const vendorId = user.messId;

        const tiffin = await TiffinTracking.findOne({ userId: parsedUserId, vendorId, month });
        if (!tiffin) return res.status(404).json({ message: 'No tiffin data for this month' });

        let paid = await PaidTracking.findOne({ userId: parsedUserId, vendorId, month });
        if (!paid) {
            paid = new PaidTracking({ userId: parsedUserId, vendorId, month, days: new Map() });
        }

        for (const dayKey of selectedDays) {
            const mealsMap = tiffin.days.get(dayKey);
            if (!mealsMap) continue;

            if (!paid.days.has(dayKey)) paid.days.set(dayKey, new Map());

            const paidDay = paid.days.get(dayKey);
            for (const [meal, taken] of mealsMap.entries()) {
                if (taken) paidDay.set(meal, true);
            }
            paid.days.set(dayKey, paidDay);
        }

        paid.markModified('days');
        await paid.save();

        const saved = await PaidTracking.findById(paid._id)
            .populate('userId', 'name email')
            .populate('vendorId', 'shopName');

        res.status(200).json({
            message: 'Selected days marked as paid',
            data: {
                ...saved.toObject(),
                days: flattenDaysForResponse(saved.days)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPaidDays = async (req, res) => {
    const { userId, month } = req.query;
    if (!userId || !month) return res.status(400).json({ message: 'userId and month required' });

    try {
        const parsedUserId = new mongoose.Types.ObjectId(userId);
        const user = await User.findById(parsedUserId).select('messId');
        if (!user?.messId) return res.status(400).json({ message: 'No vendor' });

        const paid = await PaidTracking.findOne({ userId: parsedUserId, vendorId: user.messId, month });
        if (!paid) return res.status(200).json({ data: [] });

        const paidDays = [];
        for (const [dayKey, mealsMap] of paid.days.entries()) {
            const hasPaidMeal = Array.from(mealsMap.values()).some(v => v);
            if (hasPaidMeal) paidDays.push(dayKey);
        }

        paidDays.sort((a, b) => parseInt(a) - parseInt(b));
        res.status(200).json({ data: paidDays });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};