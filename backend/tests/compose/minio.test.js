const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { mkdtempSync, writeFileSync, unlinkSync, rmdirSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const directory = mkdtempSync(join(tmpdir(), 'chattova-compose-test-'));
const emptyFile = join(directory, 'empty.env');
writeFileSync(emptyFile, '');
after(() => { unlinkSync(emptyFile); rmdirSync(directory); });
const root = join(__dirname, '../../..');

function compose(values) {
  const env = { ...process.env };
  delete env.MINIO_ROOT_USER;
  delete env.MINIO_ROOT_PASSWORD;
  Object.assign(env, values);
  const result = spawnSync('docker', ['compose', '--env-file', emptyFile, '-f', join(root, 'docker-compose.yml'), 'config', '--format', 'json'], {
    env, encoding: 'utf8',
  });
  if (result.error) throw new Error('Docker Compose is required for npm run test:compose.');
  return result;
}
test('Compose refuses missing and empty administrator credentials', () => {
  for (const values of [
    {}, { MINIO_ROOT_USER: 'ci-admin' },
    { MINIO_ROOT_PASSWORD: 'ci-only-password' },
    { MINIO_ROOT_USER: 'ci-admin', MINIO_ROOT_PASSWORD: '' },
    { MINIO_ROOT_USER: '', MINIO_ROOT_PASSWORD: 'ci-only-password' },
  ]) {
    const result = compose(values);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /MINIO_ROOT_(USER|PASSWORD)/);
  }
});
test('Compose accepts explicitly supplied credentials without a baked-in fallback', () => {
  const result = compose({ MINIO_ROOT_USER: 'ci-admin', MINIO_ROOT_PASSWORD: 'ci-only-supplied-password' });
  assert.equal(result.status, 0);
  const service = JSON.parse(result.stdout).services.minio;
  assert.equal(service.environment.MINIO_ROOT_USER, 'ci-admin');
  assert.equal(service.environment.MINIO_ROOT_PASSWORD, 'ci-only-supplied-password');
  assert.equal(service.volumes[0].target, '/data');
});
test('local environment files and backup variants are ignored, templates stay trackable', () => {
  for (const path of ['.env', 'backend/.env', '.env.backup', 'backend/.env.local']) {
    const result = spawnSync('git', ['check-ignore', '--no-index', path], { cwd: root });
    assert.equal(result.status, 0, path + ' must be ignored');
  }
  for (const path of ['.env.example', 'backend/.env.example']) {
    const result = spawnSync('git', ['check-ignore', '--no-index', path], { cwd: root });
    assert.equal(result.status, 1, path + ' must remain trackable');
  }
});
