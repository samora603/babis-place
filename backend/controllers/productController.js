const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc  Get all products (with filters, search, pagination)
// @route GET /api/products
const getProducts = async (req, res) => {
    const {
        page = 1,
        limit = 20,
        category,
        search,
        minPrice,
        maxPrice,
        sort = '-createdAt',
        inStock,
        featured,
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (inStock === 'true') query.stock = { $gt: 0 };
    if (featured === 'true') query.isFeatured = true;
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
        Product.find(query)
            .populate('category', 'name slug')
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .lean(),
        Product.countDocuments(query),
    ]);

    res.json({
        success: true,
        data: products,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
    });
};

// @desc  Get single product by slug or ID
// @route GET /api/products/:idOrSlug
const getProduct = async (req, res) => {
    const { idOrSlug } = req.params;
    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
        ? { _id: idOrSlug }
        : { slug: idOrSlug };

    const product = await Product.findOneAndUpdate(
        { ...query, isActive: true },
        { $inc: { views: 1 } },
        { new: true }
    ).populate('category', 'name slug');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
};

// @desc  Create product (admin)
// @route POST /api/products
const createProduct = async (req, res) => {
    const product = await Product.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, data: product });
};

// @desc  Update product (admin)
// @route PUT /api/products/:id
const updateProduct = async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
};

// @desc  Delete product (admin) — soft delete
// @route DELETE /api/products/:id
const deleteProduct = async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deactivated' });
};

// @desc  Upload product images to Cloudinary
// @route POST /api/products/:id/images
const uploadImages = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No images uploaded' });
    }

    // req.files already uploaded to cloudinary via multer-storage-cloudinary
    const newImages = req.files.map((file, index) => ({
        url: file.path,
        publicId: file.filename,
        isPrimary: product.images.length === 0 && index === 0,
    }));

    product.images.push(...newImages);
    await product.save();

    res.json({ success: true, images: product.images });
};

// @desc  Delete a product image
// @route DELETE /api/products/:id/images/:publicId
const deleteImage = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const publicId = decodeURIComponent(req.params.publicId);
    await cloudinary.uploader.destroy(publicId);

    product.images = product.images.filter((img) => img.publicId !== publicId);
    await product.save();

    res.json({ success: true, images: product.images });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, uploadImages, deleteImage };
