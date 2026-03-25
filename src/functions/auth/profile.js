const { app } = require('@azure/functions');
const { getUserById } = require('../../services/auth.service');
const { authenticate } = require('../../middleware/auth');
const { success } = require('../../utils/response');
const { handleError } = require('../../middleware/error-handler');

app.http('authProfile', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/profile',
  handler: async (request, context) => {
    try {
      context.log('Profile endpoint called');

      // Authenticate user
      const decoded = authenticate(request);

      // Get user data
      const user = await getUserById(decoded.userId);

      return success({ user });
    } catch (error) {
      return handleError(error, context);
    }
  }
});
