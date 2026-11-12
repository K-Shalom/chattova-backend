const { test } = require('node:test');
const assert = require('node:assert/strict');
const deepMerge = require('../../common/helpers/deepMerge');
const { assertTestDatabase } = require('../helpers/test-database');

test('partial settings preserve other preferences without mutating defaults', () => {
  const defaults = { appearance: { theme: 'light', fontSize: 14 }, privacy: { readReceipts: true } };
  const result = deepMerge(defaults, { appearance: { theme: 'dark' } });
  assert.deepEqual(result, { appearance: { theme: 'dark', fontSize: 14 }, privacy: { readReceipts: true } });
  assert.equal(defaults.appearance.theme, 'light');
});
test('array updates replace arrays and false settings remain false', () => {
  assert.deepEqual(deepMerge({ devices: ['old'], notifications: { enabled: true } },
    { devices: ['new'], notifications: { enabled: false } }),
    { devices: ['new'], notifications: { enabled: false } });
});
test('test database guard refuses non-test environments and database names', () => {
  const previous = { NODE_ENV: process.env.NODE_ENV, DB_NAME: process.env.DB_NAME };
  try {
    process.env.NODE_ENV = 'production';
    process.env.DB_NAME = 'chattova';
    assert.throws(assertTestDatabase, /disposable database/);
    process.env.NODE_ENV = 'test';
    assert.throws(assertTestDatabase, /disposable database/);
    process.env.DB_NAME = 'chattova_test';
    assert.doesNotThrow(assertTestDatabase);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
