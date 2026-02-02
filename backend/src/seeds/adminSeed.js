require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Settings = require('../models/Settings');
const Category = require('../models/Category');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ email: 'admin@carrental.com' });
    if (existingAdmin) {
      console.log('Admin already exists, skipping seed.');
    } else {
      await Admin.create({
        name: 'Super Admin',
        email: 'admin@carrental.com',
        password: 'admin123',
        role: 'superadmin',
        isActive: true
      });
      console.log('✅ Admin created: admin@carrental.com / admin123');
    }

    // Initialize settings
    await Settings.getSettings();
    console.log('✅ Settings initialized');

    // Seed default categories
    const categories = ['Economy', 'Compact', 'SUV', 'Luxury', 'Van'];
    for (const name of categories) {
      const exists = await Category.findOne({ name });
      if (!exists) {
        await Category.create({ name, description: `${name} class vehicles` });
        console.log(`✅ Category created: ${name}`);
      }
    }

    console.log('\n🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedAdmin();
