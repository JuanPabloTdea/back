const { error: errorResponse } = require('../utils/response');

/**
 * Handle errors and return appropriate HTTP response
 * @param {Error} error - Error object
 * @param {Object} context - Azure Functions context for logging
 * @returns {Object} HTTP error response
 */
function handleError(error, context) {
  // Log error details
  context.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    status: error.status || 500
  });

  // Determine status code
  const status = error.status || 500;

  // Don't expose internal error details in production
  const message = status === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : error.message;

  return errorResponse(message, status);
}

module.exports = {
  handleError
};
