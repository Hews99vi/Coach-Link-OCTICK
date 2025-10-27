// Database initialization script
// Creates User table and seeds default users

require('dotenv').config();
const db = require('./models');
const seedUsers = require('./seeders/seedUsers');

const initializeDatabase = async () => {
  try {
    console.log('🔧 Starting database initialization...\n');

    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Sync User model (create table if doesn't exist)
    console.log('📊 Syncing User model...');
    await db.User.sync({ alter: true });
    console.log('✅ User table synced successfully\n');

    // Seed users
    console.log('🌱 Seeding default users...');
    await seedUsers();

    console.log('\n✨ Database initialization completed successfully!');
    console.log('\n🔐 You can now login with these credentials:');
    console.log('   • coordinator / password (Full access)');
    console.log('   • viewer / viewer123 (Read-only access)');
    console.log('   • admin / admin123 (Full access)\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Run initialization
initializeDatabase();
