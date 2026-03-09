const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc  Create order from cart
// @route POST /api/orders
const createOrder = async (req, res) => {
    const { deliveryType, pickupLocation, deliveryAddress, customerPhone, customerName, notes } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
        return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate stock and build order items
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
        const product = item.product;
        if (!product || !product.isActive) {
            return res.status(400).json({ success: false, message: `Product "${product?.name}" is unavailable` });
        }
        if (product.stock < item.quantity) {
            return res.status(400).json({ success: false, message: `Insufficient stock for "${product.name}"` });
        }

        const priceModifier = item.variation?.priceModifier || 0;
        const effectivePrice = (product.discountPrice || product.price) + priceModifier;

        orderItems.push({
            product: product._id,
            name: product.name,
            image: product.images[0]?.url,
            price: effectivePrice,
            quantity: item.quantity,
            variation: item.variation,
        });

        subtotal += effectivePrice * item.quantity;
    }

    const deliveryFee = deliveryType === 'delivery' ? 100 : 0; // Flat rate; adjust as needed
    const totalAmount = subtotal + deliveryFee;

    const order = await Order.create({
        user: req.user.id,
        items: orderItems,
        subtotal,
        deliveryFee,
        totalAmount,
        deliveryType,
        pickupLocation: deliveryType === 'pickup' ? pickupLocation : undefined,
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : undefined,
        customerPhone,
        customerName,
        notes,
    });

    // Decrement stock
    for (const item of cart.items) {
        await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity, soldCount: item.quantity } });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

    res.status(201).json({ success: true, data: order });
};

// @desc  Get user orders
// @route GET /api/orders
const getMyOrders = async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user.id };
    if (status) query.orderStatus = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('pickupLocation', 'name building')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit)),
        Order.countDocuments(query),
    ]);

    res.json({ success: true, data: orders, total, page: Number(page), pages: Math.ceil(total / limit) });
};

// @desc  Get single order
// @route GET /api/orders/:id
const getOrder = async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
        .populate('pickupLocation', 'name building operatingHours')
        .populate('items.product', 'name slug');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
};

// @desc  Cancel order
// @route PUT /api/orders/:id/cancel
const cancelOrder = async (req, res) => {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const cancellableStatuses = ['awaiting_payment', 'confirmed'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
        return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    order.orderStatus = 'cancelled';
    order.cancelReason = req.body.reason || 'Customer request';
    order.statusHistory.push({ status: 'cancelled', note: order.cancelReason, updatedBy: req.user.id });

    // Restore stock
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
    }

    await order.save();
    res.json({ success: true, data: order });
};

module.exports = { createOrder, getMyOrders, getOrder, cancelOrder };
