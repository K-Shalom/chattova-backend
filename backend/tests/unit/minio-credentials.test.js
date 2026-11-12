const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, rmdirSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { readValue, updateEnvironment, generatePassword } = require('../../common/helpers/minioCredentials');
const { configure } = require('../../scripts/configure-minio');
const { verifyClients } = require('../../scripts/verify-minio-rotation');

test('environment updates preserve unrelated settings and remove duplicate credentials', () => {
  const updated = updateEnvironment('# private settings\r\nDB_NAME=existing\r\nMINIO_SECRET_KEY=old\r\nMINIO_SECRET_KEY=duplicate\r\n', { MINIO_SECRET_KEY: 'replacement' });
  assert.equal(readValue(updated, 'DB_NAME'), 'existing');
  assert.equal(updated.split('MINIO_SECRET_KEY=').length - 1, 1);
  assert.equal(readValue(updated, 'MINIO_SECRET_KEY'), 'replacement');
  assert.ok(updated.startsWith('# private settings'));
});
test('generated credentials contain 256 random bits in a dotenv-safe encoding', () => {
  const first = generatePassword();
  const second = generatePassword();
  assert.match(first, /^[a-f0-9]{64}$/);
  assert.notEqual(first, second);
});
test('configuration syncs files, preserves the root identity and only rotates explicitly', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'chattova-minio-test-'));
  mkdirSync(join(directory, 'backend'));
  const paths = [join(directory, '.env.example'), join(directory, 'backend/.env.example'),
    join(directory, '.env'), join(directory, 'backend/.env')];
  t.after(() => {
    for (const filename of paths) { try { unlinkSync(filename); } catch (error) { if (error.code !== 'ENOENT') throw error; } }
    rmdirSync(join(directory, 'backend'));
    rmdirSync(directory);
  });
  writeFileSync(paths[0], 'MINIO_ROOT_USER=existing_admin\nMINIO_ROOT_PASSWORD=\n');
  writeFileSync(paths[1], 'DB_NAME=preserved\nMINIO_ACCESS_KEY=\nMINIO_SECRET_KEY=\n');
  configure(directory);
  const first = readValue(readFileSync(paths[2], 'utf8'), 'MINIO_ROOT_PASSWORD');
  configure(directory);
  assert.equal(readValue(readFileSync(paths[2], 'utf8'), 'MINIO_ROOT_PASSWORD'), first);
  configure(directory, true);
  const root = readFileSync(paths[2], 'utf8');
  const backend = readFileSync(paths[3], 'utf8');
  assert.equal(readValue(root, 'MINIO_ROOT_USER'), 'existing_admin');
  assert.notEqual(readValue(root, 'MINIO_ROOT_PASSWORD'), first);
  assert.equal(readValue(backend, 'MINIO_SECRET_KEY'), readValue(root, 'MINIO_ROOT_PASSWORD'));
  assert.equal(readValue(backend, 'MINIO_ACCESS_KEY'), 'existing_admin');
  assert.equal(readValue(backend, 'DB_NAME'), 'preserved');
});

test('rotation verification succeeds only after new login and explicit old-key rejection', async () => {
  const current = { listBuckets: async () => [] };
  for (const code of ['SignatureDoesNotMatch', 'InvalidAccessKeyId']) {
    const previous = { listBuckets: async () => { throw Object.assign(new Error('denied'), { code }); } };
    await assert.doesNotReject(verifyClients(current, previous));
  }
});
test('rotation verification fails if old credentials are still accepted', async () => {
  const accepted = { listBuckets: async () => [] };
  await assert.rejects(verifyClients(accepted, accepted), /OLD_CREDENTIAL_STILL_ACCEPTED/);
});
test('network failure or ambiguous access denial does not count as revoked credentials', async () => {
  const accepted = { listBuckets: async () => [] };
  for (const code of ['ECONNREFUSED', 'AccessDenied']) {
    const failed = { listBuckets: async () => { throw Object.assign(new Error('failed'), { code }); } };
    await assert.rejects(verifyClients(accepted, failed), /INCONCLUSIVE/);
    await assert.rejects(verifyClients(failed, accepted));
  }
});
