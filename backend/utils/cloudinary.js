const cloudinary = require('../config/cloudinary');

/**
 * Upload a base64 image or file buffer to Cloudinary
 */
const uploadImage = async (file, folder = 'babis-place') => {
    const result = await cloudinary.uploader.upload(file, {
        folder,
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
    });
    return { url: result.secure_url, publicId: result.public_id };
};

/**
 * Delete image from Cloudinary by publicId
 */
const deleteImage = async (publicId) => {
    return cloudinary.uploader.destroy(publicId);
};

module.exports = { uploadImage, deleteImage };
