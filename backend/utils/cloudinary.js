const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET_KEY
});

// Helper to extract public ID from Cloudinary URL
cloudinary.getPublicIdFromUrl = (url) => {
    if (!url) return null;
    // Example: https://res.cloudinary.com/demo/image/upload/v12345678/images/filename.jpg
    // Extracts "images/filename"
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;

    // Everything after /upload/v12345678/
    const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
    // Remove extension
    return publicIdWithExtension.split('.')[0];
};

module.exports = cloudinary;