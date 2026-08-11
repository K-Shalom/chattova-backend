// modules/messages/controller.js
//
// Note: this router is mounted with mergeParams (see routes.js), so
// req.params.id here is the CONVERSATION id from the parent route
// (/conversations/:id/messages), not a message id.

const messagesService = require('./service');

async function send(req, res) {
  const conversationId = req.params.id;
  const { type, content, replyToId } = req.body;

  const message = await messagesService.sendMessage(req.user.id, conversationId, { type, content, replyToId });

  res.status(201).json({ success: true, data: message });
}

async function list(req, res) {
  const conversationId = req.params.id;
  const { limit, before } = req.query;

  const messages = await messagesService.listMessages(req.user.id, conversationId, { limit, before });

  res.status(200).json({ success: true, data: messages });
}

module.exports = { send, list };
