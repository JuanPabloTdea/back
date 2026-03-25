const { app } = require('@azure/functions');
const { exec } = require('child_process');
const { promisify } = require('util');
const { success, error: errorResponse } = require('../../utils/response');
const { getPrismaCommand } = require('../../utils/prisma-cli');

const execAsync = promisify(exec);

app.http('migrationsGenerate', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'migrations/generate',
  handler: async (request, context) => {
    try {
      context.log('Generate Prisma Client endpoint called');

      // Security: Only allow with secret key
      const migrationSecret = process.env.MIGRATION_SECRET || 'dev-migration-secret';
      const providedSecret = request.headers.get('x-migration-secret');

      if (providedSecret !== migrationSecret) {
        return errorResponse('Unauthorized: Invalid migration secret', 401);
      }

      context.log('Generating Prisma Client with binary engine...');
      context.log('Environment variables:');
      context.log('PRISMA_CLIENT_ENGINE_TYPE:', process.env.PRISMA_CLIENT_ENGINE_TYPE);
      context.log('PRISMA_CLI_QUERY_ENGINE_TYPE:', process.env.PRISMA_CLI_QUERY_ENGINE_TYPE);

      const prismaCmd = getPrismaCommand();
      context.log(`Using Prisma command: ${prismaCmd}`);

      // Generate Prisma Client with environment variables
      const generateCommand = `${prismaCmd} generate`;
      context.log(`Executing: ${generateCommand}`);

      const { stdout, stderr } = await execAsync(generateCommand, {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PRISMA_CLIENT_ENGINE_TYPE: 'binary',
          PRISMA_CLI_QUERY_ENGINE_TYPE: 'binary'
        }
      });

      context.log('Generate stdout:', stdout);
      if (stderr) {
        context.warn('Generate stderr:', stderr);
      }

      return success({
        message: 'Prisma Client generated successfully with binary engine',
        output: stdout,
        engineType: 'binary',
        environment: {
          PRISMA_CLIENT_ENGINE_TYPE: process.env.PRISMA_CLIENT_ENGINE_TYPE || 'NOT_SET',
          PRISMA_CLI_QUERY_ENGINE_TYPE: process.env.PRISMA_CLI_QUERY_ENGINE_TYPE || 'NOT_SET',
          platform: process.platform,
          arch: process.arch
        }
      });
    } catch (error) {
      context.error('Prisma Client generation failed:', error);

      return errorResponse(
        `Prisma Client generation failed: ${error.message}`,
        500
      );
    }
  }
});
