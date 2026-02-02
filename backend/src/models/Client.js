const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
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
    required: [true, 'Phone number is required'],
    trim: true
  },
  CIN: {
    type: String,
    required: [true, 'CIN is required'],
    unique: true,
    trim: true
  },
  drivingLicense: {
    number: {
      type: String,
      required: [true, 'Driving license number is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Driving license expiry date is required']
    },
    photo: {
      type: String,
      default: null
    }
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    country: { type: String, default: 'Morocco' }
  },
  photo: {
    type: String,
    default: null
  },
  score: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  totalReservations: {
    type: Number,
    default: 0
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockReason: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verificationToken: String,
  verificationExpire: Date
}, {
  timestamps: true
});

// Hash password before saving
clientSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
clientSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if driving license is valid
clientSchema.methods.isLicenseValid = function() {
  return this.drivingLicense.expiryDate > new Date();
};

module.exports = mongoose.model('Client', clientSchema);
