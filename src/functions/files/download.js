const { app } = require('@azure/functions');
const { authenticate } = require('../../middleware/auth');
const { getFileById } = require('../../services/file.service');
const { downloadFile } = require('../../services/storage.service');
const { file: fileResponse } = require('../../utils/response');
const { handleError } = require('../../middleware/error-handler');

app.http('filesDownload', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'files/{id}/download',
  handler: async (request, context) => {
    try {
      context.log('Download file endpoint called');

      // Authenticate user
      const decoded = authenticate(request);

      // Get file ID from route parameters
      const fileId = request.params.id;

      if (!fileId) {
        const error = new Error('File ID is required');
        error.status = 400;
        throw error;
      }

      // Get file metadata (with ownership verification)
      const fileMetadata = await getFileById(fileId, decoded.userId);

      // Download file from blob storage
      const buffer = await downloadFile(fileMetadata.fileName);

      // Return file as download
      return fileResponse(buffer, fileMetadata.originalName, fileMetadata.mimetype);
    } catch (error) {
      return handleError(error, context);
    }
  }
});
