const User = require('../models/User');

// @desc  Get current user profile
// @route GET /api/users/profile
const getProfile = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
};

// @desc  Update profile
// @route PUT /api/users/profile
const updateProfile = async (req, res) => {
    const { name, email, profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, email, profileImage },
        { new: true, runValidators: true }
    );
    res.json({ success: true, user });
};

// @desc  Add address
// @route POST /api/users/addresses
const addAddress = async (req, res) => {
    const user = await User.findById(req.user.id);
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
};

// @desc  Update address
// @route PUT /api/users/addresses/:addressId
const updateAddress = async (req, res) => {
    const user = await User.findById(req.user.id);
    const addr = user.addresses.id(req.params.addressId);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
    Object.assign(addr, req.body);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
};

// @desc  Delete address
// @route DELETE /api/users/addresses/:addressId
const deleteAddress = async (req, res) => {
    const user = await User.findById(req.user.id);
    user.addresses.pull(req.params.addressId);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
};

module.exports = { getProfile, updateProfile, addAddress, updateAddress, deleteAddress };
