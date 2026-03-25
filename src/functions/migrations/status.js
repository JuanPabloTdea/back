const { app } = require('@azure/functions');
const { exec } = require('child_process');
const { promisify } = require('util');
const { success, error: errorResponse } = require('../../utils/response');

const execAsync = promisify(exec);

app.http('migrationsStatus', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'migrations/status',
  handler: async (request, context) => {
    try {
      context.log('Migration status endpoint called');

      // Check migration status
      const { stdout, stderr } = await execAsync('npx prisma migrate status', {
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_CONNECTION_STRING: process.env.DATABASE_CONNECTION_STRING
        }
      });

      context.log('Status stdout:', stdout);
      if (stderr) {
        context.warn('Status stderr:', stderr);
      }

      // Parse the output to determine if migrations are needed
      const needsMigration = stdout.includes('Following migration have not yet been applied') ||
                            stdout.includes('Your database is not in sync');
      const isUpToDate = stdout.includes('Database schema is up to date');

      return success({
        needsMigration,
        isUpToDate,
        output: stdout,
        database: process.env.DATABASE_CONNECTION_STRING ? 'Connected' : 'Not configured'
      });
    } catch (error) {
      context.error('Status check failed:', error);

      return errorResponse(
        `Status check failed: ${error.message}`,
        500
      );
    }
  }
});
