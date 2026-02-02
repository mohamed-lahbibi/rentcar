const cloudinary = require('../config/cloudinary');

// Upload single image
const uploadImage = async (file, folder = 'car-rental/general') => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'image'
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
};

// Upload from buffer
const uploadBuffer = async (buffer, folder = 'car-rental/general', options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        ...options
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );
    
    uploadStream.end(buffer);
  });
};

// Delete image
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

// Delete multiple images
const deleteImages = async (publicIds) => {
  try {
    if (publicIds.length === 0) return true;
    await cloudinary.api.delete_resources(publicIds);
    return true;
  } catch (error) {
    console.error('Bulk delete error:', error);
    return false;
  }
};

// Get optimized image URL
const getOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
};

module.exports = {
  uploadImage,
  uploadBuffer,
  deleteImage,
  deleteImages,
  getOptimizedUrl
};
