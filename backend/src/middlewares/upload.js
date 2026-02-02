const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary storage for car photos
const carStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'car-rental/cars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }]
  }
});

// Cloudinary storage for user photos
const userStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'car-rental/users',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', quality: 'auto' }]
  }
});

// Cloudinary storage for documents (licenses, contracts, etc.)
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'car-rental/documents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'webp'],
    resource_type: 'auto'
  }
});

// Cloudinary storage for message images
const messageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'car-rental/messages',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }]
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer instances
const uploadCarPhotos = multer({
  storage: carStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadUserPhoto = multer({
  storage: userStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadMessageImages = multer({
  storage: messageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = {
  uploadCarPhotos,
  uploadUserPhoto,
  uploadDocument,
  uploadMessageImages
};
