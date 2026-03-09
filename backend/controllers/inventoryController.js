const Product = require('../models/Product');

// @desc  Get low stock products
// @route GET /api/inventory/low-stock
const getLowStockProducts = async (req, res) => {
    const products = await Product.find({
        isActive: true,
        $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    })
        .select('name stock lowStockThreshold images category')
        .populate('category', 'name')
        .sort('stock');

    res.json({ success: true, data: products, total: products.length });
};

// @desc  Update product stock
// @route PUT /api/inventory/:productId/stock
const updateStock = async (req, res) => {
    const { stock, lowStockThreshold } = req.body;
    const update = {};
    if (stock !== undefined) update.stock = stock;
    if (lowStockThreshold !== undefined) update.lowStockThreshold = lowStockThreshold;

    const product = await Product.findByIdAndUpdate(req.params.productId, update, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
};

// @desc  Get all products with stock info (admin inventory view)
// @route GET /api/inventory
const getInventory = async (req, res) => {
    const { page = 1, limit = 50, search, category, stockStatus } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    if (stockStatus === 'low') query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
    if (stockStatus === 'out') query.stock = 0;
    if (stockStatus === 'in') query.stock = { $gt: 0 };

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        Product.find(query)
            .select('name stock lowStockThreshold price images category soldCount')
            .populate('category', 'name')
            .sort('stock name')
            .skip(skip)
            .limit(Number(limit)),
        Product.countDocuments(query),
    ]);

    res.json({ success: true, data: products, total, pages: Math.ceil(total / limit) });
};

module.exports = { getLowStockProducts, updateStock, getInventory };
