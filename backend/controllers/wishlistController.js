const Wishlist = require('../models/Wishlist');

const getWishlist = async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
        path: 'products',
        select: 'name price discountPrice images rating reviewCount stock isActive slug',
    });
    res.json({ success: true, data: wishlist || { products: [] } });
};

const addToWishlist = async (req, res) => {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user.id, products: [productId] });
    } else if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
    }

    res.json({ success: true, data: wishlist });
};

const removeFromWishlist = async (req, res) => {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found' });
    wishlist.products.pull(req.params.productId);
    await wishlist.save();
    res.json({ success: true, data: wishlist });
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
