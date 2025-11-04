const mongoose = require('mongoose');

const tiffinTrackingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  days: {
    type: Map,
    of: {
      type: Map,
      of: Boolean,
    },
    required: true,
  },
});

module.exports = mongoose.model('TiffinTracking', tiffinTrackingSchema);