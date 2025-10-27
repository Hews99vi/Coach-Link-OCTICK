// Define Sequelize model for vehicles with fields: id (PK), plate (string required), capacity (integer required)

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association here
      // A vehicle can have many assignments
      Vehicle.hasMany(models.Assignment, {
        foreignKey: 'vehicle_id',
        as: 'assignments',
        onDelete: 'CASCADE',
      });
    }
  }

  Vehicle.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      plate: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: 'Vehicle plate number is required',
          },
          notEmpty: {
            msg: 'Vehicle plate number cannot be empty',
          },
        },
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Vehicle capacity is required',
          },
          isInt: {
            msg: 'Capacity must be an integer',
          },
          min: {
            args: [1],
            msg: 'Capacity must be at least 1',
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
      modelName: 'Vehicle',
      tableName: 'vehicles',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Vehicle;
};
