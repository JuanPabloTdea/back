const { getPrismaClient } = require('../config/database');

/**
 * Create a file record in the database
 * @param {Object} fileData - File metadata
 * @returns {Promise<Object>} Created file record
 */
async function createFile(fileData) {
  const prisma = getPrismaClient();

  return prisma.file.create({
    data: fileData,
    select: {
      id: true,
      originalName: true,
      fileName: true,
      mimetype: true,
      size: true,
      blobUrl: true,
      createdAt: true
    }
  });
}

/**
 * Get all files for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of file records
 */
async function getFilesByUserId(userId) {
  const prisma = getPrismaClient();

  return prisma.file.findMany({
    where: { userId },
    select: {
      id: true,
      originalName: true,
      mimetype: true,
      size: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Get a specific file by ID
 * @param {string} fileId - File ID
 * @param {string} userId - User ID (for ownership verification)
 * @returns {Promise<Object>} File record
 */
async function getFileById(fileId, userId) {
  const prisma = getPrismaClient();

  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId
    },
    select: {
      id: true,
      originalName: true,
      fileName: true,
      mimetype: true,
      size: true,
      blobUrl: true,
      createdAt: true
    }
  });

  if (!file) {
    const error = new Error('File not found or access denied');
    error.status = 404;
    throw error;
  }

  return file;
}

/**
 * Delete a file record from the database
 * @param {string} fileId - File ID
 * @param {string} userId - User ID (for ownership verification)
 * @returns {Promise<Object>} Deleted file record
 */
async function deleteFile(fileId, userId) {
  const prisma = getPrismaClient();

  // First verify ownership
  const file = await prisma.file.findFirst({
    where: {
      id: fileId,
      userId
    }
  });

  if (!file) {
    const error = new Error('File not found or access denied');
    error.status = 404;
    throw error;
  }

  // Delete the file record
  await prisma.file.delete({
    where: { id: fileId }
  });

  return file;
}

/**
 * Get file statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Statistics object
 */
async function getFileStats(userId) {
  const prisma = getPrismaClient();

  const result = await prisma.file.aggregate({
    where: { userId },
    _count: {
      id: true
    },
    _sum: {
      size: true
    }
  });

  const totalFiles = result._count.id || 0;
  const totalSize = result._sum.size || 0;
  const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

  return {
    totalFiles,
    totalSize,
    totalSizeMB: parseFloat(totalSizeMB)
  };
}

module.exports = {
  createFile,
  getFilesByUserId,
  getFileById,
  deleteFile,
  getFileStats
};
