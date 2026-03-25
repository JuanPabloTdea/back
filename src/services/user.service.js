const { getPrismaClient } = require('../config/database');

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User data or null
 */
async function getUserByEmail(email) {
  const prisma = getPrismaClient();

  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true
    }
  });
}

/**
 * Get user by username
 * @param {string} username - Username
 * @returns {Promise<Object|null>} User data or null
 */
async function getUserByUsername(username) {
  const prisma = getPrismaClient();

  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true
    }
  });
}

/**
 * Update user data
 * @param {string} userId - User ID
 * @param {Object} data - Data to update
 * @returns {Promise<Object>} Updated user data
 */
async function updateUser(userId, data) {
  const prisma = getPrismaClient();

  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

module.exports = {
  getUserByEmail,
  getUserByUsername,
  updateUser
};
