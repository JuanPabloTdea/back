const { app } = require('@azure/functions');
const { exec } = require('child_process');
const { promisify } = require('util');
const { success, error: errorResponse } = require('../../utils/response');
const { getPrismaCommand } = require('../../utils/prisma-cli');

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

      const prismaCmd = getPrismaCommand();
      context.log(`Using Prisma command: ${prismaCmd}`);

      // Run Prisma migrate deploy (safe for production)
      // This applies pending migrations without prompting
      const migrateCommand = `${prismaCmd} migrate deploy`;
      context.log(`Executing: ${migrateCommand}`);

      const { stdout, stderr } = await execAsync(migrateCommand, {
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
      const generateCommand = `${prismaCmd} generate`;
      context.log(`Executing: ${generateCommand}`);

      const { stdout: genStdout, stderr: genStderr } = await execAsync(generateCommand, {
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
