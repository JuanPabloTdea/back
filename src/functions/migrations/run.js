const { app } = require('@azure/functions');
const { exec } = require('child_process');
const { promisify } = require('util');
const { success, error: errorResponse } = require('../../utils/response');

const execAsync = promisify(exec);

app.http('migrationsRun', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'migrations/run',
  handler: async (request, context) => {
    try {
      context.log('Run migrations endpoint called');

      // Security: Only allow in development or with a secret key
      const migrationSecret = process.env.MIGRATION_SECRET || 'dev-migration-secret';
      const providedSecret = request.headers.get('x-migration-secret');

      if (providedSecret !== migrationSecret) {
        return errorResponse('Unauthorized: Invalid migration secret', 401);
      }

      context.log('Starting database migrations...');

      // Run Prisma migrate deploy (safe for production)
      // This applies pending migrations without prompting
      const { stdout, stderr } = await execAsync('npx prisma migrate deploy', {
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

      // Generate Prisma Client
      context.log('Generating Prisma Client...');
      const { stdout: genStdout, stderr: genStderr } = await execAsync('npx prisma generate', {
        cwd: process.cwd()
      });

      context.log('Generate stdout:', genStdout);
      if (genStderr) {
        context.warn('Generate stderr:', genStderr);
      }

      return success({
        message: 'Migrations completed successfully',
        output: {
          migrate: stdout,
          generate: genStdout
        }
      });
    } catch (error) {
      context.error('Migration failed:', error);

      return errorResponse(
        `Migration failed: ${error.message}`,
        500
      );
    }
  }
});
