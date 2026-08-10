// server.js
//
// This is the actual entry point (see package.json "main"). It takes the
// Express app from app.js, wraps it in a raw HTTP server (needed so Socket.IO
// can share the same port), attaches Socket.IO, and starts listening.

const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const config = require('./config/env');
require('./config/database'); // runs the connection check as soon as the server starts
const initSockets = require('./sockets');

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*', // tighten this to your real frontend URL(s) before production
  },
});

initSockets(io);

httpServer.listen(config.port, () => {
  console.log(`🚀 Chattova backend running on http://localhost:${config.port}`);
  console.log(`   Try it: http://localhost:${config.port}/api/v1/health`);
});
