const { app } = require('@azure/functions');
const { authenticate } = require('../../middleware/auth');
const { getFileStats } = require('../../services/file.service');
const { success } = require('../../utils/response');
const { handleError } = require('../../middleware/error-handler');

app.http('filesStats', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'files/stats',
  handler: async (request, context) => {
    try {
      context.log('File stats endpoint called');

      // Authenticate user
      const decoded = authenticate(request);

      // Get file statistics
      const stats = await getFileStats(decoded.userId);

      return success({ stats });
    } catch (error) {
      return handleError(error, context);
    }
  }
});
