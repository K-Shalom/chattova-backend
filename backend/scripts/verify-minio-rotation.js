// Read the exposed historical credentials in memory; never print them or pass
// them as command-line arguments. This script does not rewrite Git history.
const { execFileSync } = require('node:child_process');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { readValue } = require('../common/helpers/minioCredentials');

async function verifyClients(currentClient, previousClient) {
  await currentClient.listBuckets();
  try {
    await previousClient.listBuckets();
  } catch (error) {
    if (['SignatureDoesNotMatch', 'InvalidAccessKeyId'].includes(error.code)) return;
    throw new Error('OLD_CREDENTIAL_CHECK_INCONCLUSIVE');
  }
  throw new Error('OLD_CREDENTIAL_STILL_ACCEPTED');
}

async function main() {
  const { Client } = require('minio');
  const directory = join(__dirname, '../..');
  const current = readFileSync(join(directory, 'backend/.env'), 'utf8');
  const accessKey = readValue(current, 'MINIO_ACCESS_KEY');
  const secretKey = readValue(current, 'MINIO_SECRET_KEY');
  if (!accessKey || !secretKey) throw new Error('MISSING_CONFIG');
  const oldCompose = execFileSync('git', ['show', 'e6803cd:docker-compose.yml'], {
    cwd: directory, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  });
  const oldUser = oldCompose.match(/^\s*MINIO_ROOT_USER:\s*([^\r\n]+)/m)?.[1]?.trim();
  const oldPassword = oldCompose.match(/^\s*MINIO_ROOT_PASSWORD:\s*([^\r\n]+)/m)?.[1]?.trim();
  if (!oldUser || !oldPassword || secretKey === oldPassword) throw new Error('UNROTATED_OR_MISSING_HISTORY');
  const connection = {
    endPoint: readValue(current, 'MINIO_ENDPOINT') || 'localhost',
    port: Number(readValue(current, 'MINIO_PORT') || '9000'),
    useSSL: readValue(current, 'MINIO_USE_SSL') === 'true',
  };
  await verifyClients(new Client({ ...connection, accessKey, secretKey }),
    new Client({ ...connection, accessKey: oldUser, secretKey: oldPassword }));
  console.log('Verified: new credentials authenticate and the exposed credentials are rejected.');
}
module.exports = { verifyClients };
if (require.main === module) {
  const timeout = setTimeout(() => {
    console.error('Rotation verification timed out. Check that MinIO is running at the configured address.');
    process.exit(1);
  }, 15000);
  main().catch(() => {
    console.error('Rotation is NOT verified. Check configuration, Git history and the running MinIO server.');
    process.exitCode = 1;
  }).finally(() => clearTimeout(timeout));
}
