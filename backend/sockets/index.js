// sockets/index.js
//
// Sets up Socket.IO: authenticates every connection with the same JWT access
// token used for REST calls, then lets clients join/leave "rooms" — one room
// per conversation — so we can broadcast a new message only to people
// actually viewing that conversation.

const { verifyAccessToken } = require('../common/helpers/jwt');
const conversationsRepository = require('../modules/conversations/repository');
const { setIO } = require('./registry');

function initSockets(io) {
  setIO(io);

  // Runs once for every new connection attempt, BEFORE 'connection' fires.
  // The client must send its access token like this when connecting:
  //   io('http://localhost:4000', { auth: { token: accessToken } })
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const payload = verifyAccessToken(token);
      socket.user = { id: payload.sub, username: payload.username };
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 ${socket.user.username} connected (${socket.id})`);

    // A personal room per user — useful later for notifications that should
    // reach someone regardless of which conversation they currently have open.
    socket.join(`user:${socket.user.id}`);

    // The client must explicitly ask to join a conversation's room before it
    // receives live messages for it. We re-check membership here (never trust
    // the client) so someone can't listen in on a conversation they're not part of.
    socket.on('conversation:join', async (conversationId, callback) => {
      try {
        const isMember = await conversationsRepository.isParticipant(conversationId, socket.user.id);
        if (!isMember) {
          return callback?.({ success: false, error: 'Not a participant of this conversation.' });
        }
        socket.join(`conversation:${conversationId}`);
        callback?.({ success: true });
      } catch (err) {
        callback?.({ success: false, error: 'Something went wrong.' });
      }
    });

    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Typing indicators — purely ephemeral, never touches the database.
    // The client calls these while the person is actively typing/stopped.
    socket.on('typing:start', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId, userId: socket.user.id, username: socket.user.username, isTyping: true,
      });
    });

    socket.on('typing:stop', (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit('typing:update', {
        conversationId, userId: socket.user.id, username: socket.user.username, isTyping: false,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 ${socket.user.username} disconnected (${socket.id})`);
    });
  });
}

module.exports = initSockets;
