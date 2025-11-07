const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const PaidTracking = require('../models/paid-tracking');
const TiffinTracking = require('../models/tiffin-tracking');
const User = require('../models/user');
const Vendor = require('../models/vendor');

const convertDaysToNestedMap = (daysObj) => {
    const daysMap = new Map();
    for (const [day, mealsObj] of Object.entries(daysObj || {})) {
        const mealsMap = new Map();
        for (const [meal, value] of Object.entries(mealsObj)) {
            mealsMap.set(meal, !!value);
        }
        daysMap.set(day, mealsMap);
    }
    return daysMap;
};

const flattenDaysForResponse = (daysMap) => {
    return Object.fromEntries(
        Array.from(daysMap.entries()).map(([day, meals]) => [
            day,
            Object.fromEntries(Array.from(meals.entries()))
        ])
    );
};

exports.updatePaidRange = async (req, res) => {
    let { userId, month, startDay, endDay } = req.body;

    if (!userId || !month || !startDay || !endDay) {
        return res.status(400).json({ message: 'Invalid request. Missing required fields: userId, month, startDay, or endDay.' });
    }

    let parsedUserId;
    try {
        parsedUserId = new ObjectId(userId);
    } catch (error) {
        return res.status(400).json({ message: 'Invalid userId format. Must be a valid ObjectId.' });
    }

    try {
        const user = await User.findById(parsedUserId).select('messId');
        if (!user || !user.messId) {
            return res.status(400).json({ message: 'User not found or no vendor assigned. Assign a vendor first.' });
        }
        const vendorId = user.messId;

        const tiffinTracking = await TiffinTracking.findOne({ userId: parsedUserId, vendorId, month });
        if (!tiffinTracking) {
            return res.status(404).json({ message: 'No tiffin tracking data found for this month.' });
        }

        const startNum = parseInt(startDay);
        const endNum = parseInt(endDay);
        if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
            return res.status(400).json({ message: 'Invalid startDay or endDay. Must be valid numbers with start <= end.' });
        }

        let paidTracking = await PaidTracking.findOne({ userId: parsedUserId, vendorId, month });

        if (!paidTracking) {
            paidTracking = new PaidTracking({
                userId: parsedUserId,
                vendorId,
                month,
                days: new Map(),
            });
        }

        for (let dayNum = startNum; dayNum <= endNum; dayNum++) {
            const dayKey = dayNum.toString().padStart(2, '0');
            const tiffinDayMeals = tiffinTracking.days.get(dayKey);

            if (!tiffinDayMeals || Array.from(tiffinDayMeals.entries()).filter(([_, taken]) => taken).length === 0) {
                continue;
            }

            if (!paidTracking.days.has(dayKey)) {
                paidTracking.days.set(dayKey, new Map());
            }
            const paidDayMeals = paidTracking.days.get(dayKey);

            Array.from(tiffinDayMeals.entries()).forEach(([mealType, taken]) => {
                if (taken) {
                    paidDayMeals.set(mealType, true);
                }
            });

            paidTracking.days.set(dayKey, paidDayMeals);
        }

        paidTracking.markModified('days');
        await paidTracking.save();

        const savedFetched = await PaidTracking.findById(paidTracking._id).populate('userId', 'name email').populate('vendorId', 'shopName');
        const responseData = {
            ...savedFetched.toObject(),
            days: flattenDaysForResponse(savedFetched.days)
        };

        res.status(200).json({ message: 'Paid range updated successfully', data: responseData });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Error updating paid data', error: error.message });
    }
};

exports.updatePaidTracking = async (req, res) => {
    let { userId, month, days: incomingDays } = req.body;

    if (!userId || !month || !incomingDays) {
        return res.status(400).json({ message: 'Invalid request. Missing required fields: userId, month, or days.' });
    }

    let parsedUserId;
    try {
        parsedUserId = new ObjectId(userId);
    } catch (error) {
        return res.status(400).json({ message: 'Invalid userId format. Must be a valid ObjectId.' });
    }

    try {
        const user = await User.findById(parsedUserId).select('messId');
        if (!user || !user.messId) {
            return res.status(400).json({ message: 'User not found or no vendor assigned. Assign a vendor first.' });
        }
        const vendorId = user.messId;

        const daysMap = convertDaysToNestedMap(incomingDays);

        let paidTracking = await PaidTracking.findOne({ userId: parsedUserId, vendorId, month });

        if (!paidTracking) {
            paidTracking = new PaidTracking({
                userId: parsedUserId,
                vendorId,
                month,
                days: daysMap,
            });
        } else {
            for (const [day, mealsObj] of Object.entries(incomingDays)) {
                if (!paidTracking.days.has(day)) {
                    paidTracking.days.set(day, new Map());
                }
                const dayMeals = paidTracking.days.get(day);
                for (const [meal, value] of Object.entries(mealsObj)) {
                    if (value) {
                        dayMeals.set(meal, true);
                    }
                }
                paidTracking.days.set(day, dayMeals);
            }

            paidTracking.markModified('days');
        }

        await paidTracking.save();

        const savedFetched = await PaidTracking.findById(paidTracking._id).populate('userId', 'name email').populate('vendorId', 'shopName');
        const responseData = {
            ...savedFetched.toObject(),
            days: flattenDaysForResponse(savedFetched.days)
        };

        res.status(200).json({ message: 'Paid tracking updated successfully', data: responseData });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Error updating paid tracking data', error: error.message });
    }
};

const calculateTotalAmount = (mealsCount, rate) => {
    return mealsCount * rate;
};

exports.getPaidTrackingData = async (req, res) => {
    let { userId, month } = req.query;

    if (!userId) {
        return res.status(400).json({ message: 'Invalid request. Missing required field: userId.' });
    }

    let parsedUserId;
    try {
        parsedUserId = new ObjectId(userId);
    } catch (error) {
        return res.status(400).json({ message: 'Invalid userId format. Must be a valid ObjectId.' });
    }

    try {
        const user = await User.findById(parsedUserId).select('messId');
        if (!user || !user.messId) {
            return res.status(400).json({ message: 'User not found or no vendor assigned.' });
        }
        const vendorId = user.messId;

        const query = { userId: parsedUserId, vendorId };
        if (month) query.month = month;

        const paidTrackingList = await PaidTracking.find(query)
            .populate('userId', 'name email')
            .populate('vendorId', 'shopName')
            .exec();

        if (!paidTrackingList || paidTrackingList.length === 0) {
            return res.status(200).json({ message: 'No paid data found for the given userId (and optional month) with current vendor.' });
        }

        const vendor = await Vendor.findById(vendorId);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found.' });
        }
        const ratePerMeal = vendor.amountPerDay;

        const tiffinQuery = { userId: parsedUserId, vendorId };
        if (month) tiffinQuery.month = month;
        const tiffinTrackingList = await TiffinTracking.find(tiffinQuery);

        const processedData = paidTrackingList.map((paidTracking) => {
            const matchingTiffin = tiffinTrackingList.find(t => t.month === paidTracking.month);
            if (!matchingTiffin) {
                return { ...paidTracking.toObject(), totalMeals: 0, paidMeals: 0, pendingMeals: 0, paidAmount: 0, pendingAmount: 0 };
            }

            let totalMeals = 0;
            let paidMeals = 0;
            Array.from(matchingTiffin.days.entries()).forEach(([dayKey, tiffinDayMeals]) => {
                const dayTakenCount = Array.from(tiffinDayMeals.entries()).filter(([_, taken]) => taken).length;
                totalMeals += dayTakenCount;

                const paidDay = paidTracking.days.get(dayKey) || new Map();
                let dayPaidCount = 0;
                Array.from(tiffinDayMeals.entries()).forEach(([mealKey, taken]) => {
                    if (taken && paidDay.get(mealKey)) {
                        dayPaidCount++;
                    }
                });
                paidMeals += dayPaidCount;
            });

            const pendingMeals = totalMeals - paidMeals;
            const totalAmount = calculateTotalAmount(totalMeals, ratePerMeal);
            const paidAmount = calculateTotalAmount(paidMeals, ratePerMeal);
            const pendingAmount = calculateTotalAmount(pendingMeals, ratePerMeal);

            return {
                ...paidTracking.toObject(),
                days: Object.fromEntries(
                    Array.from(paidTracking.days.entries()).map(([day, meals]) => [
                        day,
                        Object.fromEntries(Array.from(meals.entries()))
                    ])
                ),
                totalMeals,
                paidMeals,
                pendingMeals,
                totalAmount,
                paidAmount,
                amountToBePaid: pendingAmount,
            };
        });

        res.status(200).json({ data: processedData });
    } catch (error) {
        console.error('Get error:', error);
        res.status(500).json({ message: 'Error retrieving paid tracking data', error: error.message });
    }
};