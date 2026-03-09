const Category = require('../models/Category');

const getCategories = async (req, res) => {
    const categories = await Category.find({ isActive: true })
        .populate('parentCategory', 'name slug')
        .sort('order name');
    res.json({ success: true, data: categories });
};

const getCategory = async (req, res) => {
    const query = req.params.id.match(/^[0-9a-fA-F]{24}$/)
        ? { _id: req.params.id }
        : { slug: req.params.id };
    const category = await Category.findOne(query).populate('parentCategory', 'name slug');
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
};

const createCategory = async (req, res) => {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
};

const updateCategory = async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
};

const deleteCategory = async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deactivated' });
};

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
