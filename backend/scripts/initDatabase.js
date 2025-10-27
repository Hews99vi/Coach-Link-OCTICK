// Database initialization script
// Creates User table and seeds default users for role-based access control

require('dotenv').config();
const db = require('../models');
const seedUsers = require('../seeders/seedUsers');

const initDatabase = async () => {
  try {
    console.log('🔧 Initializing database...\n');

    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Sync User model (create table if not exists)
    console.log('📋 Syncing User model...');
    await db.User.sync({ alter: true });
    console.log('✅ User table created/updated\n');

    // Seed default users
    console.log('🌱 Seeding default users...');
    await seedUsers();
    
    console.log('\n✅ Database initialization complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('You can now start the server with: npm run start:backend');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run initialization
initDatabase();
