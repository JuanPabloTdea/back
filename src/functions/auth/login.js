const { app } = require('@azure/functions');
const { login } = require('../../services/auth.service');
const { validate, loginSchema } = require('../../middleware/validators');
const { success } = require('../../utils/response');
const { handleError } = require('../../middleware/error-handler');

app.http('authLogin', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/login',
  handler: async (request, context) => {
    try {
      context.log('Login endpoint called');

      // Parse request body
      const body = await request.json();

      // Validate input
      const validatedData = validate(body, loginSchema);

      // Login user
      const result = await login(validatedData);

      return success(result);
    } catch (error) {
      return handleError(error, context);
    }
  }
});
