const Joi = require('joi');

// User registration schema
const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  username: Joi.string().min(3).max(30).required().messages({
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must not exceed 30 characters',
    'any.required': 'Username is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  })
});

// User login schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

/**
 * Validate data against a Joi schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Joi schema
 * @returns {Object} Validated data
 * @throws {Error} If validation fails
 */
function validate(data, schema) {
  const { error, value } = schema.validate(data, { abortEarly: false });

  if (error) {
    const message = error.details.map(detail => detail.message).join(', ');
    const validationError = new Error(message);
    validationError.status = 400;
    throw validationError;
  }

  return value;
}

module.exports = {
  registerSchema,
  loginSchema,
  validate
};
