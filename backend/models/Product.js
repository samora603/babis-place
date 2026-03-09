const mongoose = require('mongoose');
const slugify = require('slugify');

const variationSchema = new mongoose.Schema({
    name: { type: String, required: true },   // e.g. "Size", "Color"
    options: [
        {
            label: { type: String, required: true }, // e.g. "M", "Red"
            priceModifier: { type: Number, default: 0 },
            stock: { type: Number, default: 0 },
            sku: String,
        },
    ],
});

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, unique: true },
        description: { type: String, required: true },
        shortDescription: String,
        price: { type: Number, required: true, min: 0 },
        discountPrice: { type: Number, min: 0 },
        images: [
            {
                url: { type: String, required: true },
                publicId: String,         // Cloudinary public_id for deletion
                isPrimary: { type: Boolean, default: false },
            },
        ],
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        tags: [String],
        stock: { type: Number, default: 0, min: 0 },
        lowStockThreshold: { type: Number, default: 5 },
        variations: [variationSchema],
        faqs: [
            {
                question: String,
                answer: String,
            },
        ],
        weight: Number,         // grams, for delivery cost calc
        isActive: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
        views: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },
        soldCount: { type: Number, default: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

// Auto-generate slug from name
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
    }
    next();
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
