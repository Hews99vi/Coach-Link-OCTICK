// Set up Sequelize with SQLite (dev) or PostgreSQL (production)
// Supports both local development and cloud deployment

require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

// Create Sequelize instance based on environment
let sequelize;

if (process.env.DATABASE_URL) {
  // Production: Use PostgreSQL (Render, Railway, etc.)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false,
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // Development: Use SQLite
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'app.db');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection has been established successfully.');
  } catch (error) {
    console.error('✗ Unable to connect to the database:', error);
  }
};

// Only test connection if not in test environment
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

module.exports = sequelize;
