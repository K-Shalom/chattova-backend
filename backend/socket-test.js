// socket-test.js
//
// A small manual test tool — NOT part of the app itself — for confirming
// real-time messaging works. Run one instance per "user" in separate
// terminals, each with that user's access token, joined to the same
// conversation. When one user sends a message via curl (REST), the other
// instance should print it instantly.
//
// Usage:
//   node socket-test.js <accessToken> <conversationId>

const { io } = require('socket.io-client');

const [, , token, conversationId] = process.argv;

if (!token || !conversationId) {
  console.error('Usage: node socket-test.js <accessToken> <conversationId>');
  process.exit(1);
}

const socket = io('http://localhost:4000', {
  auth: { token },
});

socket.on('connect', () => {
  console.log('✅ Connected. Socket id:', socket.id);
  socket.emit('conversation:join', conversationId, (response) => {
    console.log('➡ Joined conversation:', response);
  });
});

socket.on('message:new', (message) => {
  console.log('📩 NEW MESSAGE RECEIVED:');
  console.log(JSON.stringify(message, null, 2));
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection error:', err.message);
});

socket.on('disconnect', () => {
  console.log('🔌 Disconnected.');
});
