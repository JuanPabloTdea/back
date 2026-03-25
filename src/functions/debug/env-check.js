const { app } = require('@azure/functions');
const { success } = require('../../utils/response');

app.http('debugEnvCheck', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'debug/env-check',
  handler: async (request, context) => {
    context.log('Environment check endpoint called');

    // Helper function to mask sensitive values
    const maskValue = (value) => {
      if (!value) return 'NOT_SET';
      if (value.length <= 4) return '***';
      return value.substring(0, 3) + '***' + value.substring(value.length - 3);
    };

    const envCheck = {
      NODE_ENV: process.env.NODE_ENV || 'NOT_SET',
      DATABASE_CONNECTION_STRING: process.env.DATABASE_CONNECTION_STRING ?
        'SET (length: ' + process.env.DATABASE_CONNECTION_STRING.length + ')' : 'NOT_SET',
      JWT_SECRET: process.env.JWT_SECRET ?
        'SET (length: ' + process.env.JWT_SECRET.length + ')' : 'NOT_SET',
      MIGRATION_SECRET: process.env.MIGRATION_SECRET ?
        'SET (length: ' + process.env.MIGRATION_SECRET.length + ')' : 'NOT_SET',
      MIGRATION_SECRET_PREVIEW: maskValue(process.env.MIGRATION_SECRET),
      AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING ?
        'SET (length: ' + process.env.AZURE_STORAGE_CONNECTION_STRING.length + ')' : 'NOT_SET',
      AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME || 'NOT_SET',
      PRISMA_CLIENT_ENGINE_TYPE: process.env.PRISMA_CLIENT_ENGINE_TYPE || 'NOT_SET',
      PRISMA_CLI_QUERY_ENGINE_TYPE: process.env.PRISMA_CLI_QUERY_ENGINE_TYPE || 'NOT_SET'
    };

    return success({
      message: 'Environment variables check',
      environment: envCheck,
      warnings: [
        !process.env.DATABASE_CONNECTION_STRING && 'DATABASE_CONNECTION_STRING not set',
        !process.env.JWT_SECRET && 'JWT_SECRET not set',
        !process.env.MIGRATION_SECRET && 'MIGRATION_SECRET not set (using default)',
        !process.env.AZURE_STORAGE_CONNECTION_STRING && 'AZURE_STORAGE_CONNECTION_STRING not set',
        process.env.PRISMA_CLIENT_ENGINE_TYPE !== 'binary' && 'PRISMA_CLIENT_ENGINE_TYPE should be "binary"'
      ].filter(Boolean)
    });
  }
});
