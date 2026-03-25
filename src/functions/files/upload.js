const { app } = require('@azure/functions');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../../middleware/auth');
const { uploadFile } = require('../../services/storage.service');
const { createFile } = require('../../services/file.service');
const { success } = require('../../utils/response');
const { handleError } = require('../../middleware/error-handler');
const { MAX_FILE_SIZE, MAX_FILE_SIZE_MB, ALLOWED_MIME_TYPES } = require('../../config/constants');

app.http('filesUpload', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'files/upload',
  handler: async (request, context) => {
    try {
      context.log('Upload endpoint called');

      // Authenticate user
      const decoded = authenticate(request);

      // Parse FormData
      const formData = await request.formData();
      const file = formData.get('file');

      if (!file) {
        const error = new Error('No file provided');
        error.status = 400;
        throw error;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        const error = new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE_MB}MB`);
        error.status = 413;
        throw error;
      }

      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        const error = new Error(`File type ${file.type} is not allowed`);
        error.status = 415;
        throw error;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const uniqueId = uuidv4();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${timestamp}-${uniqueId}-${sanitizedName}`;

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Azure Blob Storage
      const blobUrl = await uploadFile(buffer, uniqueFileName, file.type);

      // Save metadata to database
      const fileRecord = await createFile({
        originalName: file.name,
        fileName: uniqueFileName,
        mimetype: file.type,
        size: file.size,
        blobUrl,
        userId: decoded.userId
      });

      return success({ file: fileRecord }, 201);
    } catch (error) {
      return handleError(error, context);
    }
  }
});
