const { PrismaClient } = require('@prisma/client');

// Singleton instance
let prisma;

/**
 * Get Prisma client instance (singleton pattern)
 * @returns {PrismaClient} Prisma client
 */
function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

/**
 * Disconnect Prisma client
 */
async function disconnect() {
  if (prisma) {
    await prisma.$disconnect();
  }
}

module.exports = {
  getPrismaClient,
  disconnect
};
