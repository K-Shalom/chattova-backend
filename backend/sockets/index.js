// sockets/index.js
//
// Sets up Socket.IO event handling. Right now this just logs when someone
// connects/disconnects — real events (new message, typing, presence) get
// added here module by module as we build Phase 4 onward.

function initSockets(io) {
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
    });

    // Future events will be registered here, e.g.:
    // require('../modules/messages/message.socket')(io, socket);
    // require('../modules/presence/presence.socket')(io, socket);
  });
}

module.exports = initSockets;
