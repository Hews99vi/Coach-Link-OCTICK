// User model for role-based access control
// Roles: 'coordinator' (full access), 'viewer' (read-only)

'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Define associations here if needed
    }

    /**
     * Validate password against stored hash
     * @param {string} password - Plain text password
     * @returns {Promise<boolean>} - True if password matches
     */
    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }

    /**
     * Check if user has coordinator role
     * @returns {boolean}
     */
    isCoordinator() {
      return this.role === 'coordinator';
    }

    /**
     * Check if user has viewer role
     * @returns {boolean}
     */
    isViewer() {
      return this.role === 'viewer';
    }

    /**
     * Get user info without sensitive data
     * @returns {Object}
     */
    toJSON() {
      const values = { ...this.get() };
      delete values.password; // Never expose password
      return values;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [3, 50],
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      role: {
        type: DataTypes.ENUM('coordinator', 'viewer'),
        allowNull: false,
        defaultValue: 'viewer',
        validate: {
          isIn: [['coordinator', 'viewer']],
        },
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true,
      hooks: {
        // Hash password before creating user
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        // Hash password before updating if changed
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  return User;
};
