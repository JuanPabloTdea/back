const { app } = require('@azure/functions');
const { authenticate } = require('../../middleware/auth');
const { getFilesByUserId } = require('../../services/file.service');
const { success } = require('../../utils/response');
const { handleError } = require('../../middleware/error-handler');

app.http('filesList', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'files',
  handler: async (request, context) => {
    try {
      context.log('List files endpoint called');

      // Authenticate user
      const decoded = authenticate(request);

      // Get user's files
      const files = await getFilesByUserId(decoded.userId);

      return success({ files });
    } catch (error) {
      return handleError(error, context);
    }
  }
});
