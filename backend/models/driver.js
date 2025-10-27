// Define Sequelize model for drivers with fields: id (PK), name (string required), phone (string required)

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Driver extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define association here
      // A driver can have many assignments
      Driver.hasMany(models.Assignment, {
        foreignKey: 'driver_id',
        as: 'assignments',
        onDelete: 'CASCADE',
      });
    }
  }

  Driver.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Driver name is required',
          },
          notEmpty: {
            msg: 'Driver name cannot be empty',
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
      modelName: 'Driver',
      tableName: 'drivers',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Driver;
};
