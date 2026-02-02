const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MANAGER_PERMISSIONS } = require('../config/constants');

const managerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  photo: {
    type: String,
    default: null
  },
  permissions: [{
    type: String,
    enum: Object.values(MANAGER_PERMISSIONS)
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
managerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
managerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if manager has permission
managerSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

module.exports = mongoose.model('Manager', managerSchema);
