// Middleware to handle validation errors from express-validator

const { validationResult } = require('express-validator');

/**
 * Middleware to check for validation errors
 * Returns 400 with error details if validation fails
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  
  next();
};

module.exports = { handleValidationErrors };
