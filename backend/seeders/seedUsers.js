// Seed script to create default users for role-based access control

const bcrypt = require('bcryptjs');
const { User } = require('../models');

const seedUsers = async () => {
  try {
    console.log('🌱 Starting user seeding...');

    // Check if users already exist
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('✅ Users already exist. Skipping seed.');
      return;
    }

    // Create default users
    const users = [
      {
        username: 'coordinator',
        password: 'password', // Will be hashed by model hook
        role: 'coordinator',
        full_name: 'System Coordinator',
        email: 'coordinator@coachlink.com',
        is_active: true,
      },
      {
        username: 'viewer',
        password: 'viewer123', // Will be hashed by model hook
        role: 'viewer',
        full_name: 'System Viewer',
        email: 'viewer@coachlink.com',
        is_active: true,
      },
      {
        username: 'admin',
        password: 'admin123', // Will be hashed by model hook
        role: 'coordinator',
        full_name: 'Admin User',
        email: 'admin@coachlink.com',
        is_active: true,
      },
    ];

    // Create users individually to trigger password hashing hooks
    for (const userData of users) {
      await User.create(userData);
    }

    console.log('✅ Users seeded successfully!');
    console.log('\n📋 Default Users:');
    console.log('─────────────────────────────────────────');
    console.log('1. Username: coordinator | Password: password | Role: Coordinator');
    console.log('2. Username: viewer      | Password: viewer123 | Role: Viewer');
    console.log('3. Username: admin       | Password: admin123 | Role: Coordinator');
    console.log('─────────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('Seeding completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedUsers;
