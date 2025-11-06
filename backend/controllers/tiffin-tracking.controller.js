const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const TiffinTracking = require('../models/tiffin-tracking');
const User = require('../models/user');

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

exports.updateTracking = async (req, res) => {
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
    // Fetch user to get current vendorId
    const user = await User.findById(parsedUserId).select('messId');
    if (!user || !user.messId) {
      return res.status(400).json({ message: 'User not found or no vendor assigned. Assign a vendor first.' });
    }
    const vendorId = user.messId;

    const daysMap = convertDaysToNestedMap(incomingDays);

    let tiffinTracking = await TiffinTracking.findOne({ userId: parsedUserId, vendorId, month });

    if (!tiffinTracking) {
      tiffinTracking = new TiffinTracking({
        userId: parsedUserId,
        vendorId, // Use the fetched vendorId
        month,
        days: daysMap,
      });
    } else {
      // Merge logic (unchanged, but now scoped to vendor)
      for (const [day, mealsObj] of Object.entries(incomingDays)) {
        if (!tiffinTracking.days.has(day)) {
          tiffinTracking.days.set(day, new Map());
        }
        const dayMeals = tiffinTracking.days.get(day);
        for (const [meal, value] of Object.entries(mealsObj)) {
          dayMeals.set(meal, !!value);
        }
        tiffinTracking.days.set(day, dayMeals);
      }

      tiffinTracking.markModified('days');
    }

    await tiffinTracking.save();

    const savedFetched = await TiffinTracking.findById(tiffinTracking._id).populate('userId', 'name email').populate('vendorId', 'shopName');
    const responseData = {
      ...savedFetched.toObject(),
      days: flattenDaysForResponse(savedFetched.days)
    };

    res.status(200).json({ message: 'Tracking data updated successfully', data: responseData });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Error updating tracking data', error: error.message });
  }
};

exports.updateMultipleTracking = async (req, res) => {
  let { userId, trackingData } = req.body;

  if (!userId || !Array.isArray(trackingData) || trackingData.length === 0) {
    return res.status(400).json({ message: 'Invalid request. Missing required fields: userId or non-empty trackingData array.' });
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

    const results = [];
    const errors = [];

    for (const entry of trackingData) {
      const { month, days: incomingDays } = entry;

      if (!month || !incomingDays) {
        errors.push({ month, error: 'month and days are required for this entry' });
        continue;
      }

      try {
        const daysMap = convertDaysToNestedMap(incomingDays);

        let tiffinTracking = await TiffinTracking.findOne({ userId: parsedUserId, vendorId, month });

        if (!tiffinTracking) {
          tiffinTracking = new TiffinTracking({
            userId: parsedUserId,
            vendorId,
            month,
            days: daysMap,
          });
        } else {
          for (const [day, mealsObj] of Object.entries(incomingDays)) {
            if (!tiffinTracking.days.has(day)) {
              tiffinTracking.days.set(day, new Map());
            }
            const dayMeals = tiffinTracking.days.get(day);
            for (const [meal, value] of Object.entries(mealsObj)) {
              dayMeals.set(meal, !!value);
            }
            tiffinTracking.days.set(day, dayMeals);
          }

          tiffinTracking.markModified('days');
        }

        await tiffinTracking.save();

        const savedFetched = await TiffinTracking.findById(tiffinTracking._id);
        const responseEntry = {
          month,
          data: {
            ...savedFetched.toObject(),
            days: flattenDaysForResponse(savedFetched.days)
          }
        };
        results.push(responseEntry);
      } catch (entryError) {
        console.error(`Error for month ${month}:`, entryError);
        errors.push({ month, error: entryError.message });
      }
    }

    if (errors.length > 0) {
      return res.status(207).json({
        message: `Multiple update completed with ${errors.length} errors out of ${trackingData.length} entries`,
        success: results,
        errors
      });
    }

    res.status(200).json({ message: 'Multiple tracking data updated successfully', data: results });
  } catch (error) {
    console.error('Multiple update error:', error);
    res.status(500).json({ message: 'Error updating multiple tracking data', error: error.message });
  }
};

exports.getTrackingData = async (req, res) => {
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

    const tiffinTracking = await TiffinTracking.find(query)
      .populate('userId', 'name email')
      .populate('vendorId', 'shopName')
      .exec();

    if (!tiffinTracking || tiffinTracking.length === 0) {
      return res.status(200).json({ message: 'No data found for the given userId (and optional month) with current vendor.' });
    }

    const processedData = tiffinTracking.map(tracking => ({
      ...tracking.toObject(),
      days: Object.fromEntries(
        Array.from(tracking.days.entries()).map(([day, meals]) => [
          day,
          Object.fromEntries(Array.from(meals.entries()))
        ])
      ),
    }));

    res.status(200).json({ data: processedData });
  } catch (error) {
    console.error('Get error:', error);
    res.status(500).json({ message: 'Error retrieving tracking data', error: error.message });
  }
};