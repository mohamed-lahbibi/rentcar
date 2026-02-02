require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('../models/Car');
const Category = require('../models/Category');

const seedCars = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding cars...');

    // Clear existing cars (Optional - commented out to be safe)
    // await Car.deleteMany({});
    // console.log('Cleared existing cars');

    // Get Categories
    const categories = await Category.find({});
    const catMap = categories.reduce((acc, cat) => {
      acc[cat.name] = cat._id;
      return acc;
    }, {});

    const cars = [
      {
        brand: 'Toyota',
        model: 'RAV4',
        year: 2023,
        licensePlate: 'ABC-123',
        color: 'Silver',
        fuelType: 'petrol',
        transmission: 'automatic',
        category: catMap['SUV'] || categories[0]._id,
        dailyPrice: 80,
        mileage: 15000,
        seats: 5,
        doors: 4,
        features: ['Bluetooth', 'Backup Camera', 'Cruise Control'],
        description: 'Reliable and spacious SUV for family trips.',
        status: 'available',
        photos: [] // No images as requested
      },
      {
        brand: 'BMW',
        model: 'X5',
        year: 2024,
        licensePlate: 'XYZ-999',
        color: 'Black',
        fuelType: 'diesel',
        transmission: 'automatic',
        category: catMap['Luxury'] || categories[0]._id,
        dailyPrice: 150,
        mileage: 5000,
        seats: 5,
        doors: 4,
        features: ['Leather Seats', 'Sunroof', 'Navigation', 'Heated Seats'],
        description: 'Experience luxury and performance with the BMW X5.',
        status: 'available',
        photos: []
      },
      {
        brand: 'Ford',
        model: 'Fiesta',
        year: 2022,
        licensePlate: 'FST-555',
        color: 'Blue',
        fuelType: 'petrol',
        transmission: 'manual',
        category: catMap['Economy'] || categories[0]._id,
        dailyPrice: 40,
        mileage: 30000,
        seats: 5,
        doors: 4,
        features: ['Bluetooth', 'USB Port'],
        description: 'Compact and fuel-efficient, perfect for city driving.',
        status: 'available',
        photos: []
      },
      {
        brand: 'Tesla',
        model: 'Model 3',
        year: 2023,
        licensePlate: 'ELN-001',
        color: 'White',
        fuelType: 'electric',
        transmission: 'automatic',
        category: catMap['Luxury'] || categories[0]._id,
        dailyPrice: 120,
        mileage: 8000,
        seats: 5,
        doors: 4,
        features: ['Autopilot', 'Touchscreen', 'Premium Audio'],
        description: 'Electric future is here. Smooth and silent ride.',
        status: 'maintenance',
        photos: []
      }
    ];

    for (const carData of cars) {
        // Check if unique plate exists to prevent dup error
        const exists = await Car.findOne({ licensePlate: carData.licensePlate });
        if (!exists) {
            await Car.create(carData);
            console.log(`✅ Created: ${carData.brand} ${carData.model}`);
            
            // Update cat count
            await Category.findByIdAndUpdate(carData.category, { $inc: { carsCount: 1 } });
        } else {
            console.log(`⚠️ Skipped: ${carData.brand} ${carData.model} (Plate exists)`);
        }
    }

    console.log('\n🎉 Car seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedCars();
