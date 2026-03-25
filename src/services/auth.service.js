const { getPrismaClient } = require('../config/database');
const { hash, compare } = require('../utils/password');
const { sign } = require('../utils/jwt');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.username - Username
 * @returns {Promise<Object>} Object with token and user data
 */
async function register({ email, password, username }) {
  const prisma = getPrismaClient();

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  });

  if (existingUser) {
    const field = existingUser.email === email ? 'Email' : 'Username';
    const error = new Error(`${field} already exists`);
    error.status = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await hash(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword
    },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true
    }
  });

  // Generate JWT token
  const token = sign({
    userId: user.id,
    email: user.email,
    username: user.username
  });

  return { token, user };
}

/**
 * Login user
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Object with token and user data
 */
async function login({ email, password }) {
  const prisma = getPrismaClient();

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  // Verify password
  const isValidPassword = await compare(password, user.password);

  if (!isValidPassword) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  // Generate JWT token
  const token = sign({
    userId: user.id,
    email: user.email,
    username: user.username
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username
    }
  };
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data without password
 */
async function getUserById(userId) {
  const prisma = getPrismaClient();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true
    }
  });

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return user;
}

module.exports = {
  register,
  login,
  getUserById
};
