const path = require('path');

/**
 * Get the appropriate Prisma CLI command for the current platform
 * @returns {string} Prisma command
 */
function getPrismaCommand() {
  const isWindows = process.platform === 'win32';
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');

  if (isWindows) {
    // Windows: use node to run the Prisma script directly
    // This avoids the "npx is not recognized" error in Azure Functions (Windows)
    const prismaPath = path.join(nodeModulesPath, 'prisma', 'build', 'index.js');
    return `node "${prismaPath}"`;
  } else {
    // Unix/Linux/Mac: use npx which is more reliable
    return 'npx prisma';
  }
}

/**
 * Get path to Prisma binary directory
 * @returns {string} Path to node_modules
 */
function getNodeModulesPath() {
  return path.join(process.cwd(), 'node_modules');
}

module.exports = {
  getPrismaCommand,
  getNodeModulesPath
};
