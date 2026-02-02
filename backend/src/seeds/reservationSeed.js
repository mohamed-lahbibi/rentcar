require('dotenv').config();
const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Car = require('../models/Car');
const Client = require('../models/Client');
const bcrypt = require('bcryptjs');

const seedReservations = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding reservations...');

    // 1. Get or Create Clients
    const clients = [];
    const clientData = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        phone: '+1234567890',
        CIN: 'AB123456',
        drivingLicense: {
          number: 'DL-98765',
          expiryDate: new Date('2030-01-01')
        },
        address: { country: 'USA' }
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        phone: '+0987654321',
        CIN: 'CD987654',
        drivingLicense: {
          number: 'DL-12345',
          expiryDate: new Date('2028-05-15')
        },
        address: { country: 'UK' }
      }
    ];

    for (const data of clientData) {
      // Check by Email OR CIN to avoid duplicate errors
      let client = await Client.findOne({ 
        $or: [
            { email: data.email },
            { CIN: data.CIN }
        ]
      });

      if (!client) {
        client = await Client.create(data);
        console.log(`✅ Created Client: ${client.name}`);
      } else {
        console.log(`ℹ️ Client exists: ${client.name} (ID: ${client._id})`);
      }
      clients.push(client);
    }

    // 2. Get Cars
    const cars = await Car.find({});
    if (cars.length === 0) {
      console.error('❌ No cars found! Please run carSeed.js first.');
      process.exit(1);
    }

    // 3. Create Reservations
    const reservations = [
      {
        client: clients[0]._id,
        car: cars[0]._id, // Toyota RAV4 (Seed #1)
        pickupDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        returnDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
        totalDays: 7,
        dailyRate: cars[0].dailyPrice,
        status: 'active',
        kmAtPickup: 15000, // Matching car mileage from seed
        fuelAtPickup: 'full'
      },
      {
        client: clients[1]._id,
        car: cars[1]._id, // BMW X5
        pickupDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // In 10 days
        returnDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // In 15 days
        totalDays: 5,
        dailyRate: cars[1].dailyPrice,
        status: 'approved'
      },
      {
        client: clients[0]._id,
        car: cars[2]._id, // Ford Fiesta
        pickupDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        returnDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
        totalDays: 7,
        dailyRate: cars[2].dailyPrice,
        status: 'pending'
      },
      {
        client: clients[1]._id,
        car: cars[0]._id, // Toyota RAV4 (Previous rental)
        pickupDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        returnDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        totalDays: 5,
        dailyRate: cars[0].dailyPrice,
        status: 'completed',
        kmAtPickup: 14000,
        kmAtReturn: 14500,
        fuelAtPickup: 'full',
        fuelAtReturn: 'full',
        actualReturnDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        finalPrice: 5 * cars[0].dailyPrice
      }
    ];

    for (const resData of reservations) {
        // Calculate prices properly if missing
        if (!resData.totalPrice) {
            resData.totalPrice = resData.totalDays * resData.dailyRate;
            resData.finalPrice = resData.finalPrice || resData.totalPrice;
        }

        // Check for duplicates (simple check by client & car & date)
        const exists = await Reservation.findOne({ 
            client: resData.client, 
            car: resData.car,
            pickupDate: resData.pickupDate 
        });

        if (!exists) {
            await Reservation.create(resData);
            console.log(`✅ Created Reservation for ${resData.totalDays} days (${resData.status})`);
            
            // If active, update car status? (Optional, but good for consistency)
            if (resData.status === 'active') {
                 await Car.findByIdAndUpdate(resData.car, { status: 'rented' });
            }
        } else {
            console.log('⚠️ Duplicated reservation skipped');
        }
    }

    console.log('\n🎉 Reservation seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedReservations();
