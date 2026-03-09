const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc  Admin dashboard stats
// @route GET /api/admin/stats
const getDashboardStats = async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
        totalOrders,
        totalRevenue,
        pendingOrders,
        totalProducts,
        totalUsers,
        todayOrders,
        lowStockCount,
    ] = await Promise.all([
        Order.countDocuments({ paymentStatus: 'paid' }),
        Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Order.countDocuments({ orderStatus: 'confirmed' }),
        Product.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'customer' }),
        Order.countDocuments({ createdAt: { $gte: today } }),
        Product.countDocuments({ isActive: true, $expr: { $lte: ['$stock', '$lowStockThreshold'] } }),
    ]);

    // Revenue last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const revenueByDay = await Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$totalAmount' },
                orders: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    res.json({
        success: true,
        data: {
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            pendingOrders,
            totalProducts,
            totalUsers,
            todayOrders,
            lowStockCount,
            revenueByDay,
        },
    });
};

// @desc  Get all orders (admin)
// @route GET /api/admin/orders
const getAllOrders = async (req, res) => {
    const { page = 1, limit = 20, status, paymentStatus, search } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) query.$or = [{ orderNumber: { $regex: search, $options: 'i' } }, { customerPhone: { $regex: search } }];

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('user', 'name phone')
            .populate('pickupLocation', 'name')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit)),
        Order.countDocuments(query),
    ]);

    res.json({ success: true, data: orders, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// @desc  Update order status (admin)
// @route PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.orderStatus = status;
    order.statusHistory.push({ status, note, updatedBy: req.user.id });
    await order.save();
    res.json({ success: true, data: order });
};

// @desc  Get all users (admin)
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search } },
        { email: { $regex: search, $options: 'i' } },
    ];

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
        User.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
        User.countDocuments(query),
    ]);

    res.json({ success: true, data: users, total, pages: Math.ceil(total / limit) });
};

// @desc  Update user role (admin)
// @route PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
};

module.exports = { getDashboardStats, getAllOrders, updateOrderStatus, getAllUsers, updateUserRole };
