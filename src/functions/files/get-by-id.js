const { app } = require('@azure/functions');
const { authenticate } = require('../../middleware/auth');
const { getFileById } = require('../../services/file.service');
const { success } = require('../../utils/response');
const { handleError } = require('../../middleware/error-handler');

app.http('filesGetById', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'files/{id}',
  handler: async (request, context) => {
    try {
      context.log('Get file by ID endpoint called');

      // Authenticate user
      const decoded = authenticate(request);

      // Get file ID from route parameters
      const fileId = request.params.id;

      if (!fileId) {
        const error = new Error('File ID is required');
        error.status = 400;
        throw error;
      }

      // Get file data (with ownership verification)
      const file = await getFileById(fileId, decoded.userId);

      return success({ file });
    } catch (error) {
      return handleError(error, context);
    }
  }
});
