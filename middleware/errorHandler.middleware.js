const ApiError = require('../utils/ApiError');

// Centralized error handler — every controller forwards errors here via
// next(err) (or asyncHandler does it automatically). Keeps response shape
// consistent across the whole API.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Duplicate key error (e.g. idempotencyKey unique constraint)
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate resource — this record already exists',
      details: err.keyValue,
    });
  }

  console.error('[UNHANDLED ERROR]', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFoundHandler };
