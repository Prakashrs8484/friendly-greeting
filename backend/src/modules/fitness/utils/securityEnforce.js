/**
 * Fitness API Security & Scope Enforcer
 * Ensures strict user isolation and date filtering across all endpoints
 */

const dateUtils = require('./dateUtils');

/**
 * Middleware to validate and normalize date query parameters
 * Supports single date or date range queries
 * @returns {function} Express middleware
 */
function validateDateQuery() {
  return (req, res, next) => {
    const { date, startDate, endDate, from, to } = req.query;

    // Single date validation
    if (date) {
      if (!dateUtils.isValidDateKey(date)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
      }
      req.validatedDate = date;
    }

    // Date range validation (startDate/endDate)
    if (startDate || endDate) {
      if (startDate && !dateUtils.isValidDateKey(startDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid startDate format. Use YYYY-MM-DD',
        });
      }
      if (endDate && !dateUtils.isValidDateKey(endDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid endDate format. Use YYYY-MM-DD',
        });
      }
      if (startDate && endDate && startDate > endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate cannot be after endDate',
        });
      }
      req.validatedDateRange = { startDate, endDate };
    }

    // Date range validation (from/to)
    if (from || to) {
      if (from && !dateUtils.isValidDateKey(from)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid from date format. Use YYYY-MM-DD',
        });
      }
      if (to && !dateUtils.isValidDateKey(to)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid to date format. Use YYYY-MM-DD',
        });
      }
      if (from && to && from > to) {
        return res.status(400).json({
          success: false,
          message: 'from date cannot be after to date',
        });
      }
      req.validatedDateRange = { from, to };
    }

    next();
  };
}

/**
 * Validate MongoDB ObjectId format
 * @param {string} id - ID to validate
 * @returns {boolean} True if valid MongoDB ObjectId
 */
function isValidObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validate that a query object is properly scoped
 * Ensures all database queries include userId filter
 * @param {object} query - MongoDB query object to validate
 * @param {string} userId - Expected userId to be in query
 * @returns {boolean} True if query is properly scoped
 */
function isQueryProperlyScoped(query, userId) {
  return query.userId && query.userId.toString() === userId.toString();
}

/**
 * Enforce user isolation in a query result
 * Verifies all returned documents belong to requesting user
 * @param {object|array} result - Single document or array of documents
 * @param {string} userId - Requesting user's ID
 * @returns {boolean} True if all documents belong to user
 */
function enforceUserOwnership(result, userId) {
  if (Array.isArray(result)) {
    return result.every((doc) => doc.userId && doc.userId.toString() === userId.toString());
  }
  return result.userId && result.userId.toString() === userId.toString();
}

module.exports = {
  validateDateQuery,
  isValidObjectId,
  isQueryProperlyScoped,
  enforceUserOwnership,
};
