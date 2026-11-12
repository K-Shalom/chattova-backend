const { assertTestDatabase } = require('../helpers/test-database');
assertTestDatabase();
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { createServer } = require('node:http');
const { once } = require('node:events');
const { Server } = require('socket.io');
const { io: connect } = require('socket.io-client');
const app = require('../../app');
const pool = require('../../config/database');
const initSockets = require('../../sockets');
const server = createServer(app);
const io = new Server(server);
initSockets(io);
let baseUrl;
let first;
let second;
let outsider;
let conversationId;
const password = 'Test-only-password-123!';

async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(baseUrl + '/api/v1' + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  return { status: response.status, body: await response.json() };
}
async function register() {
  const username = 'ci_' + randomUUID().replaceAll('-', '').slice(0, 16);
  const email = username + '@example.com';
  const result = await request('/auth/register', { method: 'POST', body: { username, email, password } });
  assert.equal(result.status, 201);
  assert.equal(result.body.success, true);
  assert.equal(typeof result.body.data.accessToken, 'string');
  assert.equal(typeof result.body.data.refreshToken, 'string');
  assert.equal(result.body.data.user.password_hash, undefined);
  assert.equal(result.body.data.user.password, undefined);
  return { ...result.body.data, email };
}
before(async () => {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  baseUrl = 'http://127.0.0.1:' + server.address().port;
  first = await register();
  second = await register();
  outsider = await register();
  const result = await request('/conversations/direct', {
    method: 'POST', token: first.accessToken, body: { otherUserId: second.user.id },
  });
  assert.equal(result.status, 201);
  conversationId = result.body.data.id;
});
after(async () => {
  await new Promise((resolve) => io.close(resolve));
  await pool.end();
});

test('health checks the database and unknown routes follow the error contract', async () => {
  const health = await request('/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.data.status, 'ok');
  const missing = await request('/does-not-exist');
  assert.equal(missing.status, 404);
  assert.equal(missing.body.success, false);
  assert.equal(missing.body.error.code, 'NOT_FOUND');
});
test('invalid and duplicate registrations are rejected', async () => {
  const invalid = await request('/auth/register', { method: 'POST', body: { email: 'invalid', password: 'x' } });
  assert.equal(invalid.status, 422);
  assert.equal(invalid.body.error.code, 'VALIDATION_ERROR');
  const duplicate = await request('/auth/register', {
    method: 'POST', body: { username: 'duplicate_ci', email: first.email, password },
  });
  assert.equal(duplicate.status, 409);
});
test('login accepts the correct password and rejects the wrong password', async () => {
  const good = await request('/auth/login', { method: 'POST', body: { email: first.email, password } });
  assert.equal(good.status, 200);
  assert.equal(good.body.data.user.id, first.user.id);
  const bad = await request('/auth/login', { method: 'POST', body: { email: first.email, password: 'incorrect' } });
  assert.equal(bad.status, 401);
  assert.equal(bad.body.error.code, 'INVALID_CREDENTIALS');
});
test('protected APIs reject missing and invalid tokens', async () => {
  assert.equal((await request('/conversations')).status, 401);
  assert.equal((await request('/conversations', { token: 'invalid' })).status, 401);
});
test('direct conversations are reused and private to participants', async () => {
  const repeated = await request('/conversations/direct', {
    method: 'POST', token: second.accessToken, body: { otherUserId: first.user.id },
  });
  assert.equal(repeated.status, 201);
  assert.equal(repeated.body.data.id, conversationId);
  assert.equal((await request('/conversations/' + conversationId, { token: outsider.accessToken })).status, 404);
  const detail = await request('/conversations/' + conversationId, { token: first.accessToken });
  assert.equal(detail.body.data.participants.length, 2);
});
test('participants exchange messages while outsiders cannot read or send', async () => {
  const path = '/conversations/' + conversationId + '/messages';
  const sent = await request(path, { method: 'POST', token: first.accessToken, body: { type: 'text', content: 'CI message' } });
  assert.equal(sent.status, 201);
  const history = await request(path, { token: second.accessToken });
  assert.equal(history.status, 200);
  assert.ok(history.body.data.some((message) => message.id === sent.body.data.id && message.content === 'CI message'));
  assert.equal((await request(path, { token: outsider.accessToken })).status, 404);
  assert.equal((await request(path, { method: 'POST', token: outsider.accessToken, body: { type: 'text', content: 'unauthorized' } })).status, 404);
});
test('Socket.IO rejects missing authentication and nonmember room joins', { timeout: 10000 }, async (t) => {
  const unauthenticated = connect(baseUrl, { transports: ['websocket'], reconnection: false, timeout: 3000 });
  t.after(() => unauthenticated.disconnect());
  const [error] = await once(unauthenticated, 'connect_error');
  assert.match(error.message, /Authentication required/);
  const socket = connect(baseUrl, { auth: { token: outsider.accessToken }, transports: ['websocket'], reconnection: false, timeout: 3000 });
  t.after(() => socket.disconnect());
  await once(socket, 'connect');
  const result = await socket.timeout(3000).emitWithAck('conversation:join', conversationId);
  assert.equal(result.success, false);
});
