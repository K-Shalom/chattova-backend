const { readFileSync, writeFileSync, existsSync, chmodSync } = require('node:fs');
const { join } = require('node:path');
const { readValue, updateEnvironment, generatePassword } = require('../common/helpers/minioCredentials');

function configure(directory, rotate = false) {
  const rootPath = join(directory, '.env');
  const backendPath = join(directory, 'backend/.env');
  const rootContent = readFileSync(existsSync(rootPath) ? rootPath : join(directory, '.env.example'), 'utf8');
  const backendContent = readFileSync(existsSync(backendPath) ? backendPath : join(directory, 'backend/.env.example'), 'utf8');
  const username = readValue(rootContent, 'MINIO_ROOT_USER') || 'chattova_minio_admin';
  if (!/^[A-Za-z0-9_.-]{3,}$/.test(username)) {
    throw new Error('Use a MINIO_ROOT_USER of at least three letters, digits, dots, dashes or underscores.');
  }
  const currentPassword = readValue(rootContent, 'MINIO_ROOT_PASSWORD');
  const password = rotate || !currentPassword ? generatePassword() : currentPassword;
  const rootUpdates = { MINIO_ROOT_USER: username, MINIO_ROOT_PASSWORD: password };
  const backendUpdates = {
    MINIO_ACCESS_KEY: username, MINIO_SECRET_KEY: password,
    MINIO_ENDPOINT: readValue(backendContent, 'MINIO_ENDPOINT') || 'localhost',
    MINIO_PORT: readValue(backendContent, 'MINIO_PORT') || '9000',
    MINIO_USE_SSL: readValue(backendContent, 'MINIO_USE_SSL') || 'false',
    MINIO_BUCKET: readValue(backendContent, 'MINIO_BUCKET') || 'chattova-attachments',
  };
  for (const [filename, content] of [
    [rootPath, updateEnvironment(rootContent, rootUpdates)],
    [backendPath, updateEnvironment(backendContent, backendUpdates)],
  ]) {
    writeFileSync(filename, content, { mode: 0o600 });
    chmodSync(filename, 0o600);
  }
}
if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== '--rotate')) throw new Error('Only --rotate is supported.');
    configure(join(__dirname, '../..'), args.includes('--rotate'));
    console.log('Local MinIO credentials saved to .env and backend/.env. Values are not printed.');
    console.log('This changes configuration only. Recreate MinIO and restart the backend to apply it.');
  } catch {
    console.error('Could not configure MinIO. Check environment files, username format and file permissions.');
    process.exitCode = 1;
  }
}
module.exports = { configure };
