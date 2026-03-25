const { app } = require('@azure/functions');
const { register } = require('../../services/auth.service');
const { validate, registerSchema } = require('../../middleware/validators');
const { success } = require('../../utils/response');
const { handleError } = require('../../middleware/error-handler');

app.http('authRegister', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'auth/register',
  handler: async (request, context) => {
    try {
      context.log('Register endpoint called');

      // Parse request body
      const body = await request.json();

      // Validate input
      const validatedData = validate(body, registerSchema);

      // Register user
      const result = await register(validatedData);

      return success(result, 201);
    } catch (error) {
      return handleError(error, context);
    }
  }
});
