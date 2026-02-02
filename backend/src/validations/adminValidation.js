const Joi = require('joi');
const { FUEL_TYPES, TRANSMISSION_TYPES, CAR_STATUS } = require('../config/constants');

// Admin/Manager login
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

// Password reset request
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

// Reset password
const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match'
  })
});

// Manager creation/update
const managerSchema = Joi.object({
  name: Joi.string().max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6),
  phone: Joi.string().allow(''),
  permissions: Joi.array().items(Joi.string()),
  isActive: Joi.boolean()
});

// Car creation/update
const carSchema = Joi.object({
  brand: Joi.string().required(),
  model: Joi.string().required(),
  year: Joi.number().min(1990).max(new Date().getFullYear() + 1).required(),
  licensePlate: Joi.string().required(),
  color: Joi.string().required(),
  fuelType: Joi.string().valid(...Object.values(FUEL_TYPES)).required(),
  transmission: Joi.string().valid(...Object.values(TRANSMISSION_TYPES)).required(),
  category: Joi.string().required(),
  dailyPrice: Joi.number().min(0).required(),
  mileage: Joi.number().min(0).required(),
  seats: Joi.number().min(2).max(15),
  doors: Joi.number().min(2).max(5),
  features: Joi.array().items(Joi.string()),
  status: Joi.string().valid(...Object.values(CAR_STATUS)),
  maintenanceThreshold: Joi.number().min(1000),
  description: Joi.string().max(1000).allow('')
});

// Category creation/update
const categorySchema = Joi.object({
  name: Joi.string().max(50).required(),
  description: Joi.string().max(500).allow(''),
  isActive: Joi.boolean()
});

// Reservation status update
const reservationStatusSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected', 'cancelled', 'active', 'completed').required(),
  reason: Joi.string().max(500),
  adminNotes: Joi.string().max(1000),
  kmAtPickup: Joi.number().min(0),
  kmAtReturn: Joi.number().min(0),
  fuelAtPickup: Joi.string().valid('empty', '1/4', '1/2', '3/4', 'full'),
  fuelAtReturn: Joi.string().valid('empty', '1/4', '1/2', '3/4', 'full'),
  extraCharges: Joi.number().min(0)
});

// Maintenance creation
const maintenanceSchema = Joi.object({
  car: Joi.string().required(),
  date: Joi.date(),
  type: Joi.string().required(),
  description: Joi.string().max(1000),
  cost: Joi.number().min(0).required(),
  notes: Joi.string().max(500),
  kmAtMaintenance: Joi.number().min(0).required(),
  performedBy: Joi.string(),
  invoiceNumber: Joi.string(),
  nextMaintenanceKm: Joi.number().min(0),
  nextMaintenanceDate: Joi.date()
});

// Client score
const clientScoreSchema = Joi.object({
  client: Joi.string().required(),
  reservation: Joi.string().required(),
  score: Joi.number().min(-20).max(20).required(),
  reason: Joi.string().max(500).required(),
  comment: Joi.string().max(1000)
});

// Settings update
const settingsSchema = Joi.object({
  companyInfo: Joi.object({
    name: Joi.string(),
    address: Joi.string(),
    phone: Joi.string(),
    email: Joi.string().email(),
    website: Joi.string(),
    description: Joi.string()
  }),
  termsAndConditions: Joi.string(),
  workingHours: Joi.object(),
  notificationPreferences: Joi.object(),
  rentalPolicies: Joi.object(),
  currency: Joi.object({
    code: Joi.string(),
    symbol: Joi.string()
  })
});

module.exports = {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  managerSchema,
  carSchema,
  categorySchema,
  reservationStatusSchema,
  maintenanceSchema,
  clientScoreSchema,
  settingsSchema
};
