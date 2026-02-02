const Joi = require('joi');

// Client registration
const registerSchema = Joi.object({
  name: Joi.string().max(50).required().messages({
    'any.required': 'Name is required',
    'string.max': 'Name cannot exceed 50 characters'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Please confirm your password'
  }),
  phone: Joi.string().required().messages({
    'any.required': 'Phone number is required'
  }),
  CIN: Joi.string().required().messages({
    'any.required': 'CIN is required'
  }),
  drivingLicense: Joi.object({
    number: Joi.string().required(),
    expiryDate: Joi.date().greater('now').required().messages({
      'date.greater': 'Driving license must not be expired'
    })
  }).required(),
  address: Joi.object({
    street: Joi.string().allow(''),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    zipCode: Joi.string().allow(''),
    country: Joi.string().allow('')
  })
});

// Client login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Profile update
const profileUpdateSchema = Joi.object({
  name: Joi.string().max(50),
  phone: Joi.string(),
  drivingLicense: Joi.object({
    number: Joi.string(),
    expiryDate: Joi.date().greater('now')
  }),
  address: Joi.object({
    street: Joi.string().allow(''),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    zipCode: Joi.string().allow(''),
    country: Joi.string().allow('')
  })
});

// Change password
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match'
  })
});

// Create reservation
const reservationSchema = Joi.object({
  car: Joi.string().required().messages({
    'any.required': 'Car is required'
  }),
  pickupDate: Joi.date().required().messages({
    'any.required': 'Pickup date is required'
  }),
  returnDate: Joi.date().greater(Joi.ref('pickupDate')).required().messages({
    'date.greater': 'Return date must be after pickup date',
    'any.required': 'Return date is required'
  }),
  pickupLocation: Joi.string().allow(''),
  returnLocation: Joi.string().allow(''),
  notes: Joi.string().max(1000).allow('')
});

// Cancel reservation
const cancelReservationSchema = Joi.object({
  reason: Joi.string().max(500).required()
});

// Message schema
const messageSchema = Joi.object({
  content: Joi.string().max(5000).required(),
  conversationId: Joi.string()
});

module.exports = {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  changePasswordSchema,
  reservationSchema,
  cancelReservationSchema,
  messageSchema
};
