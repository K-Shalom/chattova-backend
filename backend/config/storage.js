// config/storage.js
//
// A thin wrapper around the MinIO client. MinIO speaks the same protocol as
// AWS S3, so this same code will work unchanged against real AWS S3 in
// production (per SAD: MinIO for dev, S3 for prod — ADR/tech stack table) —
// we'd only need to change these connection settings, not the upload logic.

const { Client } = require('minio');
const crypto = require('crypto');

const BUCKET_NAME = process.env.MINIO_BUCKET || 'chattova-attachments';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// Builds a unique, safe object name so two people uploading "photo.jpg" at
// the same time never overwrite each other's file.
function buildObjectName(originalFilename) {
  const ext = (originalFilename.split('.').pop() || 'bin').toLowerCase();
  const randomId = crypto.randomBytes(16).toString('hex');
  return `${randomId}.${ext}`;
}

// Uploads a file buffer to MinIO and returns the public URL (bucket is set
// to public-read for local dev via `mc anonymous set download`). In
// production this would return a signed URL instead of a public one.
async function uploadBuffer(buffer, originalFilename, mimeType) {
  const objectName = buildObjectName(originalFilename);

  await minioClient.putObject(BUCKET_NAME, objectName, buffer, buffer.length, {
    'Content-Type': mimeType,
  });

  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  const host = process.env.MINIO_PUBLIC_HOST || `${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}`;
  const url = `${protocol}://${host}/${BUCKET_NAME}/${objectName}`;

  return { objectName, url };
}

module.exports = { minioClient, uploadBuffer, BUCKET_NAME };
