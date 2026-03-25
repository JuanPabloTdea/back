/**
 * Create a standardized success response
 * @param {Object} data - Response data
 * @param {number} status - HTTP status code (default: 200)
 * @returns {Object} HTTP response object
 */
function success(data, status = 200) {
  return {
    status,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ success: true, ...data })
  };
}

/**
 * Create a standardized error response
 * @param {string} message - Error message
 * @param {number} status - HTTP status code (default: 500)
 * @returns {Object} HTTP response object
 */
function error(message, status = 500) {
  return {
    status,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ success: false, error: message })
  };
}

/**
 * Create a binary file response for downloads
 * @param {Buffer} buffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} mimetype - File MIME type
 * @returns {Object} HTTP response object
 */
function file(buffer, filename, mimetype) {
  return {
    status: 200,
    headers: {
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${filename}"`
    },
    body: buffer
  };
}

module.exports = {
  success,
  error,
  file
};
