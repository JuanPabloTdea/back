const { verify } = require('../utils/jwt');

/**
 * Extract and verify JWT token from Authorization header
 * @param {Object} request - HTTP request object
 * @returns {Object} Decoded user data from token
 * @throws {Error} If token is missing or invalid
 */
function authenticate(request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    const error = new Error('No authorization token provided');
    error.status = 401;
    throw error;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    const error = new Error('Invalid authorization header format. Use: Bearer <token>');
    error.status = 401;
    throw error;
  }

  const token = parts[1];

  try {
    const decoded = verify(token);
    return decoded;
  } catch (err) {
    const error = new Error(err.message || 'Invalid or expired token');
    error.status = 401;
    throw error;
  }
}

module.exports = {
  authenticate
};
