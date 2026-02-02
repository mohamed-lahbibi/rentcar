const { protect, optionalAuth } = require('./auth');
const { isAdmin, isSuperAdmin, hasPermission } = require('./isAdmin');
const { isClient, isVerified } = require('./isClient');
const { uploadCarPhotos, uploadUserPhoto, uploadDocument, uploadMessageImages } = require('./upload');
const { validate, validateQuery, validateParams } = require('./validate');
const errorHandler = require('./errorHandler');
const notFound = require('./notFound');

module.exports = {
  protect,
  optionalAuth,
  isAdmin,
  isSuperAdmin,
  hasPermission,
  isClient,
  isVerified,
  uploadCarPhotos,
  uploadUserPhoto,
  uploadDocument,
  uploadMessageImages,
  validate,
  validateQuery,
  validateParams,
  errorHandler,
  notFound
};
