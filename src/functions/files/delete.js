const { app } = require('@azure/functions');
const { authenticate } = require('../../middleware/auth');
const { deleteFile: deleteFileFromDB } = require('../../services/file.service');
const { deleteFile: deleteFileFromStorage } = require('../../services/storage.service');
const { success } = require('../../utils/response');
const { handleError } = require('../../middleware/error-handler');

app.http('filesDelete', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'files/{id}',
  handler: async (request, context) => {
    try {
      context.log('Delete file endpoint called');

      // Authenticate user
      const decoded = authenticate(request);

      // Get file ID from route parameters
      const fileId = request.params.id;

      if (!fileId) {
        const error = new Error('File ID is required');
        error.status = 400;
        throw error;
      }

      // Delete file from database (includes ownership verification)
      const deletedFile = await deleteFileFromDB(fileId, decoded.userId);

      // Delete file from blob storage
      await deleteFileFromStorage(deletedFile.fileName);

      return success({
        message: 'File deleted successfully',
        file: {
          id: deletedFile.id,
          originalName: deletedFile.originalName
        }
      });
    } catch (error) {
      return handleError(error, context);
    }
  }
});
