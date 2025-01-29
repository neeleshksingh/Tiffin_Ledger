const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    mealDetails: {
        breakfast: { type: String, required: false },
        lunch: { type: String, required: false },
        dinner: { type: String, required: false }
    }
}, { timestamps: true });

module.exports = mongoose.model('Meal', MealSchema);