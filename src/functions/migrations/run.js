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
      context.log('Platform:', process.platform);
      context.log('Architecture:', process.arch);
      context.log('PRISMA_CLIENT_ENGINE_TYPE:', process.env.PRISMA_CLIENT_ENGINE_TYPE || 'NOT_SET');
      context.log('PRISMA_CLI_QUERY_ENGINE_TYPE:', process.env.PRISMA_CLI_QUERY_ENGINE_TYPE || 'NOT_SET');

      const prismaCmd = getPrismaCommand();
      context.log(`Using Prisma command: ${prismaCmd}`);

      // First, generate Prisma Client with binary engine
      context.log('Step 1: Generating Prisma Client with binary engine...');
      const generateCommand = `${prismaCmd} generate`;

      const { stdout: genStdout, stderr: genStderr } = await execAsync(generateCommand, {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PRISMA_CLIENT_ENGINE_TYPE: 'binary',
          PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary'
        },
        timeout: 300000, // 5 minutes timeout
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      context.log('Generate stdout:', genStdout);
      if (genStderr) {
        context.warn('Generate stderr:', genStderr);
      }

      // Then run migrations
      context.log('Step 2: Running database migrations...');
      const migrateCommand = `${prismaCmd} migrate deploy`;
      context.log(`Executing: ${migrateCommand}`);

      const { stdout, stderr } = await execAsync(migrateCommand, {
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_CONNECTION_STRING: process.env.DATABASE_CONNECTION_STRING,
          PRISMA_CLIENT_ENGINE_TYPE: 'binary',
          PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary'
        },
        timeout: 300000, // 5 minutes timeout
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      context.log('Migration stdout:', stdout);
      if (stderr) {
        context.warn('Migration stderr:', stderr);
      }

      return success({
        message: 'Migrations completed successfully',
        output: {
          generate: genStdout,
          migrate: stdout
        },
        engineType: 'binary'
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
