const mongoose = require('mongoose');

const pickupLocationSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        building: { type: String, required: true },
        description: String,
        coordinates: {
            lat: Number,
            lng: Number,
        },
        operatingHours: {
            weekdays: { open: String, close: String },
            weekends: { open: String, close: String },
        },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('PickupLocation', pickupLocationSchema);
