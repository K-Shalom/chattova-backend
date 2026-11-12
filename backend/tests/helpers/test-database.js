// Run before importing application modules: dotenv must not select the developer DB.
function assertTestDatabase() {
  if (process.env.NODE_ENV !== 'test' || !process.env.DB_NAME?.endsWith('_test')) {
    throw new Error('Set NODE_ENV=test and DB_NAME to a disposable database ending in _test.');
  }
}
module.exports = { assertTestDatabase };
