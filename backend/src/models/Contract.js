const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: [true, 'Reservation is required'],
    unique: true
  },
  contractNumber: {
    type: String,
    required: true,
    unique: true
  },
  clientInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    CIN: { type: String, required: true },
    drivingLicense: { type: String, required: true },
    address: { type: String }
  },
  carInfo: {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    licensePlate: { type: String, required: true },
    color: { type: String, required: true },
    mileage: { type: Number, required: true }
  },
  rentalInfo: {
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    pickupTime: { type: String },
    pickupLocation: { type: String },
    returnLocation: { type: String },
    totalDays: { type: Number, required: true },
    dailyRate: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    deposit: { type: Number, default: 0 }
  },
  insuranceType: {
    type: String,
    enum: ['none', 'basic', 'standard', 'premium'],
    default: 'basic'
  },
  additionalOptions: {
    gps: { type: Boolean, default: false },
    childSeat: { type: Boolean, default: false },
    additionalDriver: { type: Boolean, default: false },
    unlimitedMileage: { type: Boolean, default: false }
  },
  specialConditions: {
    type: String,
    default: ''
  },
  terms: {
    type: String,
    required: true
  },
  clientSignature: {
    type: String,
    default: null
  },
  clientSignedAt: {
    type: Date,
    default: null
  },
  adminSignature: {
    type: String,
    default: null
  },
  adminSignedAt: {
    type: Date,
    default: null
  },
  pdfUrl: {
    type: String,
    default: null
  },
  pdfPublicId: {
    type: String,
    default: null
  },
  isSigned: {
    type: Boolean,
    default: false
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'generatedByType'
  },
  generatedByType: {
    type: String,
    enum: ['Admin', 'Manager']
  }
}, {
  timestamps: true
});

// Generate contract number before saving
contractSchema.pre('save', async function(next) {
  if (!this.contractNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments() + 1;
    this.contractNumber = `CTR-${year}${month}-${String(count).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Contract', contractSchema);
