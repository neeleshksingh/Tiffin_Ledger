const TiffinTracking = require('../models/tiffin-tracking');

exports.updateTracking = async (req, res) => {
  const { userId, month, days } = req.body;

  try {
    let tiffinTracking = await TiffinTracking.findOne({ userId, month });

    if (!tiffinTracking) {
      tiffinTracking = new TiffinTracking({
        userId,
        month,
        days,
      });
    } else {
      for (let day in days) {
        tiffinTracking.days.set(day, days[day]);
      }
    }

    await tiffinTracking.save();
    res.status(200).json({ message: 'Tracking data updated successfully', data: tiffinTracking });
  } catch (error) {
    res.status(500).json({ message: 'Error updating tracking data', error: error.message });
  }
};

exports.getTrackingData = async (req, res) => {
  const { userId, month } = req.query;

  try {
    const query = { userId };
    if (month) query.month = month;

    const tiffinTracking = await TiffinTracking.find(query)
      .populate('userId', 'name email')
      .exec();

    if (!tiffinTracking || tiffinTracking.length === 0) {
      return res.status(200).json({ message: 'For the given month no data found' });
    }

    res.status(200).json({ data: tiffinTracking });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving tracking data', error: error.message });
  }
};