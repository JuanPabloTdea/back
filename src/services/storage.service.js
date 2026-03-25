const { getContainerClient } = require('../config/storage');

/**
 * Upload a file to Azure Blob Storage
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Unique file name
 * @param {string} mimetype - File MIME type
 * @returns {Promise<string>} Blob URL
 */
async function uploadFile(buffer, fileName, mimetype) {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: mimetype
    }
  });

  return blockBlobClient.url;
}

/**
 * Download a file from Azure Blob Storage
 * @param {string} fileName - File name in blob storage
 * @returns {Promise<Buffer>} File buffer
 */
async function downloadFile(fileName) {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  const downloadResponse = await blockBlobClient.download();
  const buffer = await streamToBuffer(downloadResponse.readableStreamBody);

  return buffer;
}

/**
 * Delete a file from Azure Blob Storage
 * @param {string} fileName - File name in blob storage
 * @returns {Promise<void>}
 */
async function deleteFile(fileName) {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  await blockBlobClient.deleteIfExists();
}

/**
 * Get public URL for a blob
 * @param {string} fileName - File name in blob storage
 * @returns {string} Blob URL
 */
function getFileUrl(fileName) {
  const containerClient = getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  return blockBlobClient.url;
}

/**
 * Convert a readable stream to a buffer
 * @param {ReadableStream} readableStream - Readable stream
 * @returns {Promise<Buffer>} Buffer
 */
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}

module.exports = {
  uploadFile,
  downloadFile,
  deleteFile,
  getFileUrl
};
