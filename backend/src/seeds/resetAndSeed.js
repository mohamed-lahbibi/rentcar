require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('../models/Car');
const Client = require('../models/Client');
const Reservation = require('../models/Reservation');
const Category = require('../models/Category');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 MongoDB connected...');

    // 1. CLEAR DATA
    console.log('🧹 Clearing existing data...');
    await Car.deleteMany({});
    await Client.deleteMany({});
    await Reservation.deleteMany({});
    await Category.deleteMany({}); // Optional, but good for fresh start if needed.
    // Re-seed categories just in case
    const categories = [
      { name: 'SUV', description: 'Spacious and powerful', icon: 'car-suv' },
      { name: 'Sedan', description: 'Comfortable and elegant', icon: 'car-sedan' },
      { name: 'Luxury', description: 'Premium experience', icon: 'diamond' },
      { name: 'Electric', description: 'Eco-friendly', icon: 'zap' }
    ];
    const createdCats = await Category.insertMany(categories);
    console.log('✅ Categories reset.');

    // 2. SEED CARS
    console.log('🚗 Seeding Cars...');
    const cars = await Car.create([
      {
        brand: 'Tesla', model: 'Model 3', year: 2024,
        category: createdCats.find(c => c.name === 'Electric')._id,
        licensePlate: 'ELEC-001',
        dailyPrice: 120, status: 'available',
        transmission: 'automatic', fuelType: 'electric',
        mileage: 5000, color: 'White',
        features: ['Autopilot', 'GPS', 'Bluetooth', 'Heated Seats']
      },
      {
        brand: 'BMW', model: 'X5', year: 2023,
        category: createdCats.find(c => c.name === 'Luxury')._id,
        licensePlate: 'LUX-999',
        dailyPrice: 250, status: 'available', // Will be updated by active res
        transmission: 'automatic', fuelType: 'diesel',
        mileage: 15000, color: 'Black',
        features: ['Leather Seats', 'Sunroof', '4x4', 'Premium Sound']
      },
      {
        brand: 'Toyota', model: 'RAV4', year: 2022,
        category: createdCats.find(c => c.name === 'SUV')._id,
        licensePlate: 'SUV-123',
        dailyPrice: 80, status: 'available',
        transmission: 'automatic', fuelType: 'hybrid',
        mileage: 45000, color: 'Silver',
        features: ['Bluetooth', 'Rear Camera', 'Cruise Control']
      },
      {
        brand: 'Ford', model: 'Fiesta', year: 2021,
        category: createdCats.find(c => c.name === 'Sedan')._id,
        licensePlate: 'ECO-555',
        dailyPrice: 40, status: 'maintenance',
        transmission: 'manual', fuelType: 'petrol',
        mileage: 80000, color: 'Blue',
        features: ['USB', 'AC']
      },
      {
        brand: 'Mercedes', model: 'C-Class', year: 2023,
        category: createdCats.find(c => c.name === 'Luxury')._id,
        licensePlate: 'BENZ-001',
        dailyPrice: 180, status: 'rented',
        transmission: 'automatic', fuelType: 'diesel',
        mileage: 10000, color: 'Grey',
        features: ['Leather', 'Navi', 'Ambient Light']
      }
    ]);

    // Update Category Counts
    for (const car of cars) {
        await Category.findByIdAndUpdate(car.category, { $inc: { carsCount: 1 } });
    }

    // 3. SEED CLIENTS
    console.log('busts Seeding Clients...');
    const clients = await Client.create([
      {
        name: 'Sarah Connor', email: 'sarah@test.com', phone: '+123456789',
        password: 'password123', CIN: 'SF123456',
        drivingLicense: { number: 'DL-SF1', expiryDate: '2030-01-01' },
        address: { city: 'Los Angeles', country: 'USA' }
      },
      {
        name: 'Tony Stark', email: 'tony@test.com', phone: '+987654321',
        password: 'password123', CIN: 'TS987654',
        drivingLicense: { number: 'DL-TS1', expiryDate: '2028-05-05' },
        address: { city: 'New York', country: 'USA' }
      },
      {
        name: 'Bruce Wayne', email: 'bruce@test.com', phone: '+1122334455',
        password: 'password123', CIN: 'BW112233',
        drivingLicense: { number: 'DL-BW1', expiryDate: '2029-12-31' },
        address: { city: 'Gotham', country: 'USA' }
      }
    ]);

    // 4. SEED RESERVATIONS
    console.log('📅 Seeding Reservations...');
    
    // Helpers
    const day = 24 * 60 * 60 * 1000;
    const today = Date.now();

    const reservations = [
      // Active (Tony Stark has the Mercedes)
      {
        client: clients[1]._id, car: cars[4]._id,
        pickupDate: new Date(today - 2 * day),
        returnDate: new Date(today + 5 * day),
        status: 'active',
        totalDays: 7, dailyRate: 180, totalPrice: 7 * 180, finalPrice: 7 * 180
      },
      // Approved (Sarah booked the Tesla for next week)
      {
        client: clients[0]._id, car: cars[0]._id,
        pickupDate: new Date(today + 7 * day),
        returnDate: new Date(today + 10 * day),
        status: 'approved',
        totalDays: 3, dailyRate: 120, totalPrice: 360, finalPrice: 360
      },
      // Pending (Bruce wants the BMW)
      {
        client: clients[2]._id, car: cars[1]._id,
        pickupDate: new Date(today + 3 * day),
        returnDate: new Date(today + 6 * day),
        status: 'pending',
        totalDays: 3, dailyRate: 250, totalPrice: 750, finalPrice: 750
      },
      // Completed (Tony rented the RAV4 last month)
      {
        client: clients[1]._id, car: cars[2]._id,
        pickupDate: new Date(today - 30 * day),
        returnDate: new Date(today - 25 * day),
        status: 'completed',
        totalDays: 5, dailyRate: 80, totalPrice: 400, finalPrice: 400
      },
      // Cancelled (Sarah cancelled a Fiesta booking)
      {
        client: clients[0]._id, car: cars[3]._id,
        pickupDate: new Date(today - 10 * day),
        returnDate: new Date(today - 8 * day),
        status: 'cancelled',
        totalDays: 2, dailyRate: 40, totalPrice: 80, finalPrice: 80
      },
      // Rejected (Bruce tried to book the same BMW for overlapping dates)
      {
        client: clients[2]._id, car: cars[1]._id,
        pickupDate: new Date(today + 4 * day),
        returnDate: new Date(today + 5 * day),
        status: 'rejected',
        rejectionReason: 'Car unavailable for these dates',
        totalDays: 1, dailyRate: 250, totalPrice: 250, finalPrice: 250
      }
    ];

    for (const res of reservations) {
        await Reservation.create(res);
    }

    console.log('✨ Database reset and seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding:', error);
    process.exit(1);
  }
};

seedData();
