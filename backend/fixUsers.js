// Fix users with plain text passwords by re-seeding

require('dotenv').config();
const db = require('./models');

const fixUsers = async () => {
  try {
    console.log('🔧 Fixing user passwords...\n');

    // Delete all existing users
    const deleted = await db.User.destroy({ where: {} });
    console.log(`✅ Deleted ${deleted} existing users\n`);

    // Re-seed users (this will trigger password hashing)
    const seedUsers = require('./seeders/seedUsers');
    await seedUsers();

    console.log('\n✨ User passwords fixed successfully!');
    console.log('You can now login with:');
    console.log('  • viewer / viewer123');
    console.log('  • coordinator / password');
    console.log('  • admin / admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to fix users:', error);
    process.exit(1);
  }
};

fixUsers();
