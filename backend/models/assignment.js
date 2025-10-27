// Define Sequelize model for assignments with fields: 
// id (PK), request_id (FK to service_requests), driver_id (FK to drivers), 
// vehicle_id (FK to vehicles), scheduled_time (date required)

'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Assignment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Define associations here
      // An assignment belongs to a service request
      Assignment.belongsTo(models.ServiceRequest, {
        foreignKey: 'request_id',
        as: 'serviceRequest',
        onDelete: 'CASCADE',
      });

      // An assignment belongs to a driver
      Assignment.belongsTo(models.Driver, {
        foreignKey: 'driver_id',
        as: 'driver',
        onDelete: 'CASCADE',
      });

      // An assignment belongs to a vehicle
      Assignment.belongsTo(models.Vehicle, {
        foreignKey: 'vehicle_id',
        as: 'vehicle',
        onDelete: 'CASCADE',
      });
    }
  }

  Assignment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      request_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'service_requests',
          key: 'id',
        },
        validate: {
          notNull: {
            msg: 'Service request ID is required',
          },
        },
      },
      driver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'drivers',
          key: 'id',
        },
        validate: {
          notNull: {
            msg: 'Driver ID is required',
          },
        },
      },
      vehicle_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'vehicles',
          key: 'id',
        },
        validate: {
          notNull: {
            msg: 'Vehicle ID is required',
          },
        },
      },
      scheduled_time: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Scheduled time is required',
          },
          isDate: {
            msg: 'Scheduled time must be a valid date',
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
      modelName: 'Assignment',
      tableName: 'assignments',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return Assignment;
};
