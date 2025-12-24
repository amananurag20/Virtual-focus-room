const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dzyjupgqe', // You can update this if needed
    api_key: '853294675562295',
    api_secret: 'QADB37R8mKBgSeIx2vy2CY8Fslk'
});

// Upload to Cloudinary
const uploadToCloudinary = async (file, folder = 'focus-room') => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder,
            resource_type: 'auto' // Automatically detect file type
        });
        return {
            url: result.secure_url,
            publicId: result.public_id,
            type: result.resource_type
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

module.exports = { cloudinary, uploadToCloudinary };
