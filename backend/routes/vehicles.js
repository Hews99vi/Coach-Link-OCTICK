// Read-only endpoints for vehicles: GET /vehicles

const express = require('express');
const router = express.Router();

const db = require('../models');

// GET /api/vehicles - Get all vehicles
router.get('/', async (req, res, next) => {
  try {
    const vehicles = await db.Vehicle.findAll({
      order: [['plate', 'ASC']],
      include: [
        {
          model: db.Assignment,
          as: 'assignments',
          required: false,
          limit: 5,
          order: [['scheduled_time', 'DESC']],
        },
      ],
    });

    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/vehicles/:id - Get a single vehicle by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const vehicle = await db.Vehicle.findByPk(id, {
      include: [
        {
          model: db.Assignment,
          as: 'assignments',
          required: false,
          include: [
            { model: db.ServiceRequest, as: 'serviceRequest' },
            { model: db.Driver, as: 'driver' },
          ],
        },
      ],
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found',
      });
    }

    res.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
