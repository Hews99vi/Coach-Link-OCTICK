// Simple script to verify database setup and seeded data
require('dotenv').config();
const db = require('../models');

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying database setup...\n');

    // Test connection
    await db.sequelize.authenticate();
    console.log('✓ Database connection successful\n');

    // Check drivers
    const drivers = await db.Driver.findAll();
    console.log(`📊 Drivers count: ${drivers.length}`);
    drivers.forEach(driver => {
      console.log(`  - ${driver.name} (${driver.phone})`);
    });

    // Check vehicles
    const vehicles = await db.Vehicle.findAll();
    console.log(`\n📊 Vehicles count: ${vehicles.length}`);
    vehicles.forEach(vehicle => {
      console.log(`  - Plate: ${vehicle.plate}, Capacity: ${vehicle.capacity}`);
    });

    // Check service requests
    const requests = await db.ServiceRequest.findAll();
    console.log(`\n📊 Service Requests count: ${requests.length}`);

    // Check assignments
    const assignments = await db.Assignment.findAll();
    console.log(`📊 Assignments count: ${assignments.length}`);

    console.log('\n✅ Database verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying database:', error);
    process.exit(1);
  }
}

verifyDatabase();
