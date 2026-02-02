const mongoose = require('mongoose');
const { CAR_STATUS, FUEL_TYPES, TRANSMISSION_TYPES } = require('../config/constants');

const carSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1990, 'Year must be 1990 or later'],
    max: [new Date().getFullYear() + 1, 'Invalid year']
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true
  },
  fuelType: {
    type: String,
    enum: Object.values(FUEL_TYPES),
    required: [true, 'Fuel type is required']
  },
  transmission: {
    type: String,
    enum: Object.values(TRANSMISSION_TYPES),
    required: [true, 'Transmission type is required']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  dailyPrice: {
    type: Number,
    required: [true, 'Daily price is required'],
    min: [0, 'Price cannot be negative']
  },
  photos: [{
    url: { type: String, required: true },
    publicId: { type: String }
  }],
  mileage: {
    type: Number,
    required: [true, 'Mileage is required'],
    min: [0, 'Mileage cannot be negative']
  },
  seats: {
    type: Number,
    default: 5,
    min: [2, 'Minimum 2 seats'],
    max: [15, 'Maximum 15 seats']
  },
  doors: {
    type: Number,
    default: 4,
    min: [2, 'Minimum 2 doors'],
    max: [5, 'Maximum 5 doors']
  },
  features: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: Object.values(CAR_STATUS),
    default: CAR_STATUS.AVAILABLE
  },
  maintenanceThreshold: {
    type: Number,
    default: 10000, // km before maintenance reminder
    min: [1000, 'Threshold must be at least 1000 km']
  },
  lastMaintenanceKm: {
    type: Number,
    default: 0
  },
  lastMaintenanceDate: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
carSchema.virtual('fullName').get(function() {
  return `${this.brand} ${this.model} (${this.year})`;
});

// Virtual for availability check
carSchema.virtual('isAvailable').get(function() {
  const { CAR_STATUS } = require('../config/constants');
  return this.status === CAR_STATUS.AVAILABLE;
});

// Check if maintenance is due
carSchema.methods.isMaintenanceDue = function() {
  return (this.mileage - this.lastMaintenanceKm) >= this.maintenanceThreshold;
};

// Index for searching
carSchema.index({ brand: 'text', model: 'text', licensePlate: 'text' });

module.exports = mongoose.model('Car', carSchema);
