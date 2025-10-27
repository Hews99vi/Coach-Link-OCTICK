#!/usr/bin/env node

/**
 * Script to generate a bcrypt hashed password
 * Usage: node scripts/hashPassword.js [password]
 * If no password is provided, it will prompt for one
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    console.log('\n✅ Password hashed successfully!');
    console.log('\n📋 Copy this hash to your .env file:');
    console.log(`COORDINATOR_PASSWORD=${hash}`);
    console.log('\n');
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    process.exit(1);
  }
}

// Get password from command line argument or prompt
const password = process.argv[2];

if (password) {
  hashPassword(password);
} else {
  // Prompt for password
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter password to hash: ', (inputPassword) => {
    rl.close();
    
    if (!inputPassword) {
      console.error('❌ Password is required');
      process.exit(1);
    }

    hashPassword(inputPassword);
  });
}
