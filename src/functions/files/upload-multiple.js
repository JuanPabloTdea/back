const { app } = require('@azure/functions');
const { v4: uuidv4 } = require('uuid');
const { authenticate } = require('../../middleware/auth');
const { uploadFile } = require('../../services/storage.service');
const { createFile } = require('../../services/file.service');
const { success } = require('../../utils/response');
const { handleError } = require('../../middleware/error-handler');
const { MAX_FILE_SIZE, MAX_FILE_SIZE_MB, ALLOWED_MIME_TYPES } = require('../../config/constants');

app.http('filesUploadMultiple', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'files/upload-multiple',
  handler: async (request, context) => {
    try {
      context.log('Upload multiple endpoint called');

      // Authenticate user
      const decoded = authenticate(request);

      // Parse FormData
      const formData = await request.formData();
      const files = formData.getAll('files');

      if (!files || files.length === 0) {
        const error = new Error('No files provided');
        error.status = 400;
        throw error;
      }

      const uploadedFiles = [];
      const errors = [];

      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        try {
          // Validate file size
          if (file.size > MAX_FILE_SIZE) {
            errors.push({
              fileName: file.name,
              error: `File size exceeds maximum limit of ${MAX_FILE_SIZE_MB}MB`
            });
            continue;
          }

          // Validate file type
          if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            errors.push({
              fileName: file.name,
              error: `File type ${file.type} is not allowed`
            });
            continue;
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

          uploadedFiles.push(fileRecord);
        } catch (fileError) {
          errors.push({
            fileName: file.name,
            error: fileError.message
          });
        }
      }

      return success({
        files: uploadedFiles,
        errors: errors.length > 0 ? errors : undefined
      }, 201);
    } catch (error) {
      return handleError(error, context);
    }
  }
});
