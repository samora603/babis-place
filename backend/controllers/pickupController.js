const PickupLocation = require('../models/PickupLocation');

const getPickupLocations = async (req, res) => {
    const locations = await PickupLocation.find({ isActive: true }).sort('order name');
    res.json({ success: true, data: locations });
};

const addPickupLocation = async (req, res) => {
    const location = await PickupLocation.create(req.body);
    res.status(201).json({ success: true, data: location });
};

const updatePickupLocation = async (req, res) => {
    const location = await PickupLocation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!location) return res.status(404).json({ success: false, message: 'Pickup location not found' });
    res.json({ success: true, data: location });
};

const deletePickupLocation = async (req, res) => {
    const location = await PickupLocation.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!location) return res.status(404).json({ success: false, message: 'Pickup location not found' });
    res.json({ success: true, message: 'Pickup location deactivated' });
};

module.exports = { getPickupLocations, addPickupLocation, updatePickupLocation, deletePickupLocation };
