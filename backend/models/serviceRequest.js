// Define Sequelize model for service_requests with fields: 
// id (PK), created_at (timestamp default now), customer_name (string required), 
// phone (string required), pickup_location (string), dropoff_location (string), 
// pickup_time (date required), passengers (integer), notes (text), 
// status (enum: 'pending','approved','rejected','scheduled' default 'pending').

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ServiceRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association here
      // A service request can have one assignment
      ServiceRequest.hasOne(models.Assignment, {
        foreignKey: 'request_id',
        as: 'assignment',
        onDelete: 'CASCADE',
      });
    }
  }

  ServiceRequest.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      customer_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Customer name is required',
          },
          notEmpty: {
            msg: 'Customer name cannot be empty',
          },
        },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Phone number is required',
          },
          notEmpty: {
            msg: 'Phone number cannot be empty',
          },
        },
      },
      pickup_location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dropoff_location: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pickup_time: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Pickup time is required',
          },
          isDate: {
            msg: 'Pickup time must be a valid date',
          },
        },
      },
      passengers: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: {
            msg: 'Passengers must be an integer',
          },
          min: {
            args: [1],
            msg: 'At least 1 passenger is required',
          },
        },
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'scheduled'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: {
            args: [['pending', 'approved', 'rejected', 'scheduled']],
            msg: 'Status must be one of: pending, approved, rejected, scheduled',
          },
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'ServiceRequest',
      tableName: 'service_requests',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return ServiceRequest;
};
