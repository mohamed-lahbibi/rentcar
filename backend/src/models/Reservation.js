const mongoose = require('mongoose');
const { RESERVATION_STATUS } = require('../config/constants');

const reservationSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required']
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car is required']
  },
  pickupDate: {
    type: Date,
    required: [true, 'Pickup date is required']
  },
  returnDate: {
    type: Date,
    required: [true, 'Return date is required']
  },
  actualReturnDate: {
    type: Date,
    default: null
  },
  totalDays: {
    type: Number,
    required: true
  },
  dailyRate: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  extraCharges: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  finalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(RESERVATION_STATUS),
    default: RESERVATION_STATUS.PENDING
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  kmAtPickup: {
    type: Number,
    default: null
  },
  kmAtReturn: {
    type: Number,
    default: null
  },
  fuelAtPickup: {
    type: String,
    enum: ['empty', '1/4', '1/2', '3/4', 'full'],
    default: null
  },
  fuelAtReturn: {
    type: String,
    enum: ['empty', '1/4', '1/2', '3/4', 'full'],
    default: null
  },
  pickupLocation: {
    type: String,
    default: 'Office'
  },
  returnLocation: {
    type: String,
    default: 'Office'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'approvedByType'
  },
  approvedByType: {
    type: String,
    enum: ['Admin', 'Manager']
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  cancellationReason: {
    type: String,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Calculate total days before saving
reservationSchema.pre('save', function(next) {
  if (this.pickupDate && this.returnDate) {
    const diffTime = Math.abs(this.returnDate - this.pickupDate);
    this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }
  next();
});

// Virtual for duration in human readable format
reservationSchema.virtual('duration').get(function() {
  if (this.totalDays === 1) return '1 day';
  return `${this.totalDays} days`;
});

// Index for queries
reservationSchema.index({ client: 1, status: 1 });
reservationSchema.index({ car: 1, status: 1 });
reservationSchema.index({ pickupDate: 1, returnDate: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
