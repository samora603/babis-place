const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // verify purchased
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, trim: true, maxlength: 1000 },
        images: [{ url: String, publicId: String }],
        isVerifiedPurchase: { type: Boolean, default: false },
        isApproved: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// One review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// After save: update product rating average
reviewSchema.post('save', async function () {
    const Product = mongoose.model('Product');
    const stats = await mongoose.model('Review').aggregate([
        { $match: { product: this.product, isApproved: true } },
        { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats.length > 0) {
        await Product.findByIdAndUpdate(this.product, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            reviewCount: stats[0].count,
        });
    }
});

module.exports = mongoose.model('Review', reviewSchema);
