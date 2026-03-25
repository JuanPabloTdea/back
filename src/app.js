// Entry point for Azure Functions v4
// This file imports all function definitions

// Health check
require('./functions/health');

// Database migrations
require('./functions/migrations/run');
require('./functions/migrations/status');
require('./functions/migrations/create');

// Authentication endpoints
require('./functions/auth/register');
require('./functions/auth/login');
require('./functions/auth/profile');

// File management endpoints
require('./functions/files/upload');
require('./functions/files/upload-multiple');
require('./functions/files/list');
require('./functions/files/stats');
require('./functions/files/get-by-id');
require('./functions/files/download');
require('./functions/files/delete');
