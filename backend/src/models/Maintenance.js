const mongoose = require('mongoose');
const { MAINTENANCE_TYPES } = require('../config/constants');

const maintenanceSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car is required']
  },
  date: {
    type: Date,
    required: [true, 'Maintenance date is required'],
    default: Date.now
  },
  type: {
    type: String,
    enum: Object.values(MAINTENANCE_TYPES),
    required: [true, 'Maintenance type is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  cost: {
    type: Number,
    required: [true, 'Cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  kmAtMaintenance: {
    type: Number,
    required: [true, 'Mileage at maintenance is required'],
    min: [0, 'Mileage cannot be negative']
  },
  performedBy: {
    type: String,
    trim: true
  },
  invoiceNumber: {
    type: String,
    trim: true
  },
  invoicePhoto: {
    url: { type: String },
    publicId: { type: String }
  },
  nextMaintenanceKm: {
    type: Number,
    default: null
  },
  nextMaintenanceDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByType'
  },
  createdByType: {
    type: String,
    enum: ['Admin', 'Manager']
  }
}, {
  timestamps: true
});

// Index for queries
maintenanceSchema.index({ car: 1, date: -1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
