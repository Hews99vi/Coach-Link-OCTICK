// Read-only endpoints for drivers: GET /drivers

const express = require('express');
const router = express.Router();

const db = require('../models');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET /api/drivers - Get all drivers
// Both coordinators and viewers can access (read-only)
router.get('/', authMiddleware, requireRole('coordinator', 'viewer'), async (req, res, next) => {
  try {
    const drivers = await db.Driver.findAll({
      order: [['name', 'ASC']],
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
      data: drivers,
      count: drivers.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/drivers/:id - Get a single driver by ID
// Both coordinators and viewers can access (read-only)
router.get('/:id', authMiddleware, requireRole('coordinator', 'viewer'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const driver = await db.Driver.findByPk(id, {
      include: [
        {
          model: db.Assignment,
          as: 'assignments',
          required: false,
          include: [
            { model: db.ServiceRequest, as: 'serviceRequest' },
            { model: db.Vehicle, as: 'vehicle' },
          ],
        },
      ],
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found',
      });
    }

    res.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
