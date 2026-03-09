const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc  Get product reviews
// @route GET /api/reviews/:productId
const getProductReviews = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
        Review.find({ product: req.params.productId, isApproved: true })
            .populate('user', 'name profileImage')
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit)),
        Review.countDocuments({ product: req.params.productId, isApproved: true }),
    ]);
    res.json({ success: true, data: reviews, total, pages: Math.ceil(total / limit) });
};

// @desc  Add/update review (must have purchased product)
// @route POST /api/reviews
const addReview = async (req, res) => {
    const { productId, rating, comment, images } = req.body;

    // Verify purchase
    const purchasedOrder = await Order.findOne({
        user: req.user.id,
        'items.product': productId,
        paymentStatus: 'paid',
    });

    const isVerifiedPurchase = !!purchasedOrder;

    const existing = await Review.findOne({ user: req.user.id, product: productId });
    let review;

    if (existing) {
        existing.rating = rating;
        existing.comment = comment;
        if (images) existing.images = images;
        review = await existing.save();
    } else {
        review = await Review.create({
            user: req.user.id,
            product: productId,
            order: purchasedOrder?._id,
            rating,
            comment,
            images,
            isVerifiedPurchase,
        });
    }

    res.status(201).json({ success: true, data: review });
};

// @desc  Delete review
// @route DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
    const query = req.user.role === 'admin'
        ? { _id: req.params.id }
        : { _id: req.params.id, user: req.user.id };

    const review = await Review.findOneAndDelete(query);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
};

module.exports = { getProductReviews, addReview, deleteReview };
