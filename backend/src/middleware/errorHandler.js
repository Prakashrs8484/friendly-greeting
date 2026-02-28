/**
 * Global Error Handler Middleware
 * Ensures all errors return JSON responses, never HTML
 * This middleware must have 4 parameters (err, req, res, next) to be recognized as error handler
 */
module.exports = (err, req, res, next) => {
  // Ensure response hasn't been sent yet
  if (res.headersSent) {
    return next(err);
  }

  // Log error with context
  console.error('[Error Handler]', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    userId: req.user?._id
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Ensure we return JSON, never HTML
  res.setHeader('Content-Type', 'application/json');
  
  // Return JSON error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
