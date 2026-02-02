const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  companyInfo: {
    name: { type: String, default: 'Car Rental' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    website: { type: String, default: '' },
    logo: { type: String, default: null },
    description: { type: String, default: '' }
  },
  termsAndConditions: {
    type: String,
    default: `
1. The renter must be at least 21 years old and hold a valid driving license.
2. The vehicle must be returned in the same condition as when rented.
3. The renter is responsible for any traffic violations during the rental period.
4. Fuel should be at the same level as at pickup.
5. Late returns will incur additional charges.
6. The renter is liable for any damage to the vehicle during the rental period.
7. Smoking is not permitted in any of our vehicles.
8. The vehicle cannot be taken outside the country without prior written approval.
9. In case of an accident, the renter must notify us immediately.
10. Cancellation policy: Free cancellation up to 24 hours before pickup.
    `
  },
  workingHours: {
    monday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
    tuesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
    wednesday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
    thursday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
    friday: { open: { type: String, default: '09:00' }, close: { type: String, default: '18:00' }, isOpen: { type: Boolean, default: true } },
    saturday: { open: { type: String, default: '09:00' }, close: { type: String, default: '13:00' }, isOpen: { type: Boolean, default: true } },
    sunday: { open: { type: String, default: '00:00' }, close: { type: String, default: '00:00' }, isOpen: { type: Boolean, default: false } }
  },
  notificationPreferences: {
    emailOnNewReservation: { type: Boolean, default: true },
    emailOnReservationApproval: { type: Boolean, default: true },
    emailOnReservationRejection: { type: Boolean, default: true },
    emailOnMaintenanceDue: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false }
  },
  rentalPolicies: {
    minimumRentalDays: { type: Number, default: 1 },
    maximumRentalDays: { type: Number, default: 30 },
    advanceBookingDays: { type: Number, default: 60 },
    cancellationHours: { type: Number, default: 24 },
    lateFeePerHour: { type: Number, default: 50 },
    depositPercentage: { type: Number, default: 20 }
  },
  currency: {
    code: { type: String, default: 'MAD' },
    symbol: { type: String, default: 'DH' }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
