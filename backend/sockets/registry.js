// sockets/registry.js
//
// Holds a single reference to the Socket.IO server instance so any other
// file in the backend (like messages/service.js) can broadcast events
// without server.js having to pass `io` through every function call.

let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.IO has not been initialized yet.');
  }
  return ioInstance;
}

module.exports = { setIO, getIO };
