// Simple script to query and display SQLite database contents
require('dotenv').config();
const db = require('../models');

async function viewDatabase() {
  try {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║         COACH-LINK DATABASE VIEWER                        ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');

    // Get all tables with data
    const drivers = await db.Driver.findAll({ raw: true });
    const vehicles = await db.Vehicle.findAll({ raw: true });
    const requests = await db.ServiceRequest.findAll({ raw: true });
    const assignments = await db.Assignment.findAll({ 
      raw: true,
      include: [
        { model: db.Driver, as: 'driver' },
        { model: db.Vehicle, as: 'vehicle' },
        { model: db.ServiceRequest, as: 'serviceRequest' }
      ]
    });

    // Display Drivers
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ DRIVERS TABLE                                           │');
    console.log('└─────────────────────────────────────────────────────────┘');
    if (drivers.length === 0) {
      console.log('  No drivers found.\n');
    } else {
      console.table(drivers);
    }

    // Display Vehicles
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ VEHICLES TABLE                                          │');
    console.log('└─────────────────────────────────────────────────────────┘');
    if (vehicles.length === 0) {
      console.log('  No vehicles found.\n');
    } else {
      console.table(vehicles);
    }

    // Display Service Requests
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ SERVICE REQUESTS TABLE                                  │');
    console.log('└─────────────────────────────────────────────────────────┘');
    if (requests.length === 0) {
      console.log('  No service requests found.\n');
    } else {
      console.table(requests);
    }

    // Display Assignments
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ ASSIGNMENTS TABLE                                       │');
    console.log('└─────────────────────────────────────────────────────────┘');
    if (assignments.length === 0) {
      console.log('  No assignments found.\n');
    } else {
      console.table(assignments);
    }

    // Summary
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║ SUMMARY                                                   ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log(`  Total Drivers:          ${drivers.length}`);
    console.log(`  Total Vehicles:         ${vehicles.length}`);
    console.log(`  Total Service Requests: ${requests.length}`);
    console.log(`  Total Assignments:      ${assignments.length}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error viewing database:', error);
    process.exit(1);
  }
}

viewDatabase();
