// Implement POST /requests endpoint: Validate required fields (name, phone, pickup_time etc.) 
// using express-validator or manual checks. Return 201 on success, 400 with JSON 
// {message: 'Invalid data', errors: [...]} on failure. Insert into DB via Sequelize.
//
// GET /requests: Support query params for page (default 1), limit (default 10), 
// search (name or phone), status. Use Sequelize findAll with where, offset, limit. 
// Include count for pagination meta.
//
// PUT /requests/:id: If status to 'scheduled', require driver_id, vehicle_id, scheduled_time. 
// Create assignment record. Validate enums and existence of driver/vehicle. 
// Return 200 with updated request.

const express = require('express');
const { body, query, param } = require('express-validator');
const { Op } = require('sequelize');
const router = express.Router();

const db = require('../models');
const { handleValidationErrors } = require('../middleware/validation');

// Validation rules for creating a service request
const createRequestValidation = [
  body('customer_name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Phone number must contain only digits and valid separators'),
  
  body('pickup_location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Pickup location must not exceed 255 characters'),
  
  body('dropoff_location')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Dropoff location must not exceed 255 characters'),
  
  body('pickup_time')
    .notEmpty()
    .withMessage('Pickup time is required')
    .isISO8601()
    .withMessage('Pickup time must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      if (date < new Date()) {
        throw new Error('Pickup time must be in the future');
      }
      return true;
    }),
  
  body('passengers')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Passengers must be a number between 1 and 100'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
];

// POST /api/requests - Create a new service request (Public)
router.post('/', createRequestValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { customer_name, phone, pickup_location, dropoff_location, pickup_time, passengers, notes } = req.body;

    const serviceRequest = await db.ServiceRequest.create({
      customer_name,
      phone,
      pickup_location,
      dropoff_location,
      pickup_time,
      passengers,
      notes,
      status: 'pending', // Default status
    });

    res.status(201).json({
      success: true,
      message: 'Service request created successfully',
      data: serviceRequest,
    });
  } catch (error) {
    next(error);
  }
});

// Validation rules for listing requests
const listRequestsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('search')
    .optional()
    .trim(),
  
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'scheduled'])
    .withMessage('Status must be one of: pending, approved, rejected, scheduled'),
];

// GET /api/requests - List all service requests with pagination and filters (Admin)
router.get('/', listRequestsValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};

    // Add status filter if provided
    if (status) {
      whereClause.status = status;
    }

    // Add search filter if provided (search in customer_name or phone)
    if (search) {
      whereClause[Op.or] = [
        { customer_name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    // Query with pagination
    const { count, rows } = await db.ServiceRequest.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: db.Assignment,
          as: 'assignment',
          required: false,
          include: [
            { model: db.Driver, as: 'driver' },
            { model: db.Vehicle, as: 'vehicle' },
          ],
        },
      ],
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/requests/:id - Get a single service request by ID
router.get('/:id', 
  param('id').isInt().withMessage('ID must be an integer'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const serviceRequest = await db.ServiceRequest.findByPk(id, {
        include: [
          {
            model: db.Assignment,
            as: 'assignment',
            required: false,
            include: [
              { model: db.Driver, as: 'driver' },
              { model: db.Vehicle, as: 'vehicle' },
            ],
          },
        ],
      });

      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: 'Service request not found',
        });
      }

      res.json({
        success: true,
        data: serviceRequest,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Validation rules for updating a request
const updateRequestValidation = [
  param('id').isInt().withMessage('ID must be an integer'),
  
  body('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected', 'scheduled'])
    .withMessage('Status must be one of: pending, approved, rejected, scheduled'),
  
  body('driver_id')
    .if(body('status').equals('scheduled'))
    .notEmpty()
    .withMessage('Driver ID is required when scheduling')
    .isInt()
    .withMessage('Driver ID must be an integer'),
  
  body('vehicle_id')
    .if(body('status').equals('scheduled'))
    .notEmpty()
    .withMessage('Vehicle ID is required when scheduling')
    .isInt()
    .withMessage('Vehicle ID must be an integer'),
  
  body('scheduled_time')
    .if(body('status').equals('scheduled'))
    .notEmpty()
    .withMessage('Scheduled time is required when scheduling')
    .isISO8601()
    .withMessage('Scheduled time must be a valid date'),
];

// PUT /api/requests/:id - Update a service request (Admin)
// If status to 'scheduled', require driver_id, vehicle_id, scheduled_time. 
// Create assignment record. Validate enums and existence of driver/vehicle. 
// Return 200 with updated request.
router.put('/:id', updateRequestValidation, handleValidationErrors, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, driver_id, vehicle_id, scheduled_time, ...otherFields } = req.body;

    // Find the service request
    const serviceRequest = await db.ServiceRequest.findByPk(id);

    if (!serviceRequest) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found',
      });
    }

    // If scheduling, validate driver and vehicle exist
    if (status === 'scheduled') {
      const driver = await db.Driver.findByPk(driver_id);
      if (!driver) {
        return res.status(400).json({
          success: false,
          message: 'Invalid data',
          errors: [{ field: 'driver_id', message: 'Driver not found' }],
        });
      }

      const vehicle = await db.Vehicle.findByPk(vehicle_id);
      if (!vehicle) {
        return res.status(400).json({
          success: false,
          message: 'Invalid data',
          errors: [{ field: 'vehicle_id', message: 'Vehicle not found' }],
        });
      }

      // Check if passengers fit in vehicle
      if (serviceRequest.passengers && serviceRequest.passengers > vehicle.capacity) {
        return res.status(400).json({
          success: false,
          message: 'Invalid data',
          errors: [{
            field: 'vehicle_id',
            message: `Vehicle capacity (${vehicle.capacity}) is less than required passengers (${serviceRequest.passengers})`,
          }],
        });
      }

      // Create or update assignment
      const [assignment, created] = await db.Assignment.findOrCreate({
        where: { request_id: id },
        defaults: {
          request_id: id,
          driver_id,
          vehicle_id,
          scheduled_time,
        },
      });

      if (!created) {
        // Update existing assignment
        await assignment.update({
          driver_id,
          vehicle_id,
          scheduled_time,
        });
      }
    }

    // Update the service request
    await serviceRequest.update({
      status: status || serviceRequest.status,
      ...otherFields,
    });

    // Fetch updated request with associations
    const updatedRequest = await db.ServiceRequest.findByPk(id, {
      include: [
        {
          model: db.Assignment,
          as: 'assignment',
          required: false,
          include: [
            { model: db.Driver, as: 'driver' },
            { model: db.Vehicle, as: 'vehicle' },
          ],
        },
      ],
    });

    res.json({
      success: true,
      message: 'Service request updated successfully',
      data: updatedRequest,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/requests/:id - Delete a service request (Admin)
router.delete('/:id',
  param('id').isInt().withMessage('ID must be an integer'),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const serviceRequest = await db.ServiceRequest.findByPk(id);

      if (!serviceRequest) {
        return res.status(404).json({
          success: false,
          message: 'Service request not found',
        });
      }

      // Delete the service request (CASCADE will delete associated assignment)
      await serviceRequest.destroy();

      res.json({
        success: true,
        message: 'Service request deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
