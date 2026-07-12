import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import Role from './models/Role.js';
import Department from './models/Department.js';
import EmissionFactor from './models/EmissionFactor.js';

// Seed initial roles and departments on startup
const seedData = async () => {
  try {
    const roles = ['Admin', 'Manager', 'Employee'];
    for (const name of roles) {
      await Role.findOneAndUpdate({ name }, { name }, { upsert: true, new: true });
    }

    const departments = [
      { name: 'Operations', code: 'OPS', description: 'Day-to-day operations management' },
      { name: 'Facilities', code: 'FAC', description: 'Building and infrastructure management' },
      { name: 'Logistics', code: 'LOG', description: 'Supply chain and transportation' },
      { name: 'IT', code: 'IT', description: 'Technology and systems department' },
      { name: 'HR', code: 'HR', description: 'Human resources management' },
    ];
    for (const dept of departments) {
      await Department.findOneAndUpdate({ code: dept.code }, dept, { upsert: true, new: true });
    }

    const factors = [
      { name: 'Grid Electricity', activityType: 'Energy', factor: 0.85, unit: 'kWh' },
      { name: 'Solar Power', activityType: 'Energy', factor: 0.05, unit: 'kWh' },
      { name: 'Diesel Generator', activityType: 'Fuel', factor: 2.68, unit: 'Liters' },
      { name: 'Natural Gas', activityType: 'Fuel', factor: 2.02, unit: 'm3' },
      { name: 'Domestic Flight', activityType: 'Travel', factor: 0.15, unit: 'km' },
      { name: 'International Flight', activityType: 'Travel', factor: 0.11, unit: 'km' },
      { name: 'Company Car (Petrol)', activityType: 'Travel', factor: 0.19, unit: 'km' },
      { name: 'Landfill Waste', activityType: 'Waste', factor: 0.44, unit: 'kg' },
      { name: 'Recycled Waste', activityType: 'Waste', factor: 0.02, unit: 'kg' },
      { name: 'Municipal Water Supply', activityType: 'Water', factor: 0.0003, unit: 'Liters' },
    ];
    for (const f of factors) {
      await EmissionFactor.findOneAndUpdate({ name: f.name }, f, { upsert: true, new: true });
    }

    console.log('✅ Seed data initialized (Roles, Departments, Emission Factors)');
  } catch (err) {
    console.error('⚠️  Seed data error:', err.message);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedData();
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
});

process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
