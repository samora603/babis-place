const express = require('express');
const router = express.Router();
const { getPickupLocations, addPickupLocation, updatePickupLocation, deletePickupLocation } = require('../controllers/pickupController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/', getPickupLocations); // Public
router.post('/', protect, adminOnly, addPickupLocation);
router.put('/:id', protect, adminOnly, updatePickupLocation);
router.delete('/:id', protect, adminOnly, deletePickupLocation);

module.exports = router;
