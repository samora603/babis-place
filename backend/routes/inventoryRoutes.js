const express = require('express');
const router = express.Router();
const { getLowStockProducts, updateStock, getInventory } = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.use(protect, adminOnly);
router.get('/', getInventory);
router.get('/low-stock', getLowStockProducts);
router.put('/:productId/stock', updateStock);

module.exports = router;
