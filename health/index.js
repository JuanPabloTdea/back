const { app } = require('@azure/functions');

app.http('health', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'health',
    handler: async (request, context) => {
        context.log('Health check endpoint called');

        const healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            service: 'Azure Function Backend',
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'production',
            uptime: process.uptime(),
            checks: {
                api: 'ok',
                runtime: 'ok'
            }
        };

        return {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(healthStatus, null, 2)
        };
    }
});
