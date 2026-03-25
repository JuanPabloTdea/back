const { BlobServiceClient } = require('@azure/storage-blob');

const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME || 'files';

let blobServiceClient;
let containerClient;

/**
 * Get Azure Blob Storage container client
 * @returns {ContainerClient} Container client
 */
function getContainerClient() {
  if (!CONNECTION_STRING) {
    throw new Error('AZURE_STORAGE_CONNECTION_STRING environment variable is not set');
  }

  if (!containerClient) {
    blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
    containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
  }

  return containerClient;
}

/**
 * Initialize storage container (create if doesn't exist)
 */
async function initializeContainer() {
  const container = getContainerClient();
  await container.createIfNotExists({
    access: 'blob' // Allow public read access to blobs
  });
}

module.exports = {
  getContainerClient,
  initializeContainer,
  CONTAINER_NAME
};
