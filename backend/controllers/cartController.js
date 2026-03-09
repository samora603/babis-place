const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc  Get user cart
// @route GET /api/cart
const getCart = async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id }).populate({
        path: 'items.product',
        select: 'name price discountPrice images stock isActive slug',
    });
    res.json({ success: true, data: cart || { items: [] } });
};

// @desc  Add item to cart (or increment qty)
// @route POST /api/cart
const addToCart = async (req, res) => {
    const { productId, quantity = 1, variation } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: 'Product not available' });
    }
    if (product.stock < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });

    const existingIndex = cart.items.findIndex(
        (item) =>
            item.product.toString() === productId &&
            JSON.stringify(item.variation) === JSON.stringify(variation)
    );

    if (existingIndex > -1) {
        cart.items[existingIndex].quantity += quantity;
    } else {
        cart.items.push({ product: productId, quantity, variation });
    }

    await cart.save();
    await cart.populate({ path: 'items.product', select: 'name price discountPrice images stock slug' });
    res.json({ success: true, data: cart });
};

// @desc  Update cart item quantity
// @route PUT /api/cart/:itemId
const updateCartItem = async (req, res) => {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

    if (quantity <= 0) {
        cart.items.pull(req.params.itemId);
    } else {
        item.quantity = quantity;
    }

    await cart.save();
    res.json({ success: true, data: cart });
};

// @desc  Remove item from cart
// @route DELETE /api/cart/:itemId
const removeFromCart = async (req, res) => {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items.pull(req.params.itemId);
    await cart.save();
    res.json({ success: true, data: cart });
};

// @desc  Clear cart
// @route DELETE /api/cart
const clearCart = async (req, res) => {
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
    res.json({ success: true, message: 'Cart cleared' });
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
