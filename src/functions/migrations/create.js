const { app } = require('@azure/functions');
const { exec } = require('child_process');
const { promisify } = require('util');
const { success, error: errorResponse } = require('../../utils/response');
const { getPrismaCommand } = require('../../utils/prisma-cli');

const execAsync = promisify(exec);

app.http('migrationsCreate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'migrations/create',
  handler: async (request, context) => {
    try {
      context.log('Create migration endpoint called');

      // Only allow in development
      if (process.env.NODE_ENV === 'production') {
        return errorResponse('Migration creation is not allowed in production', 403);
      }

      // Security: Require secret key
      const migrationSecret = process.env.MIGRATION_SECRET || 'dev-migration-secret';
      const providedSecret = request.headers.get('x-migration-secret');

      if (providedSecret !== migrationSecret) {
        return errorResponse('Unauthorized: Invalid migration secret', 401);
      }

      // Get migration name from request body
      const body = await request.json();
      const migrationName = body.name || 'migration';

      // Validate migration name (alphanumeric and underscores only)
      if (!/^[a-zA-Z0-9_]+$/.test(migrationName)) {
        return errorResponse('Invalid migration name. Use only alphanumeric characters and underscores.', 400);
      }

      context.log(`Creating migration: ${migrationName}`);

      const prismaCmd = getPrismaCommand();
      context.log(`Using Prisma command: ${prismaCmd}`);

      // Run Prisma migrate dev to create a new migration
      const createCommand = `${prismaCmd} migrate dev --name ${migrationName}`;
      context.log(`Executing: ${createCommand}`);

      const { stdout, stderr } = await execAsync(createCommand, {
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_CONNECTION_STRING: process.env.DATABASE_CONNECTION_STRING
        }
      });

      context.log('Migration stdout:', stdout);
      if (stderr) {
        context.warn('Migration stderr:', stderr);
      }

      return success({
        message: `Migration '${migrationName}' created successfully`,
        output: stdout
      });
    } catch (error) {
      context.error('Migration creation failed:', error);

      return errorResponse(
        `Migration creation failed: ${error.message}`,
        500
      );
    }
  }
});
