// modules/messages/controller.js
//
// This router is mounted with mergeParams under /conversations/:id, so
// req.params.id is always the CONVERSATION id, and req.params.messageId
// (where present) is the specific message being acted on.

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

async function edit(req, res) {
  const { id: conversationId, messageId } = req.params;
  const { content } = req.body;
  const message = await messagesService.editMessage(req.user.id, conversationId, messageId, content);
  res.status(200).json({ success: true, data: message });
}

async function remove(req, res) {
  const { id: conversationId, messageId } = req.params;
  const result = await messagesService.deleteMessage(req.user.id, conversationId, messageId);
  res.status(200).json({ success: true, data: result });
}

async function react(req, res) {
  const { id: conversationId, messageId } = req.params;
  const { emoji } = req.body;
  const result = await messagesService.addReaction(req.user.id, conversationId, messageId, emoji);
  res.status(200).json({ success: true, data: result });
}

async function unreact(req, res) {
  const { id: conversationId, messageId, emoji } = req.params;
  const result = await messagesService.removeReaction(req.user.id, conversationId, messageId, emoji);
  res.status(200).json({ success: true, data: result });
}

module.exports = { send, list, edit, remove, react, unreact };
