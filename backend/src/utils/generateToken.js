const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate JWT token
const generateToken = (id, type) => {
  return jwt.sign(
    { id, type },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Generate random token for password reset
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash token for storage
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateToken,
  generateRandomToken,
  hashToken
};
