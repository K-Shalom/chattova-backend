// modules/conversations/controller.js

const conversationsService = require('./service');

async function createDirect(req, res) {
  const { otherUserId } = req.body;
  const conversation = await conversationsService.createOrGetDirectConversation(req.user.id, otherUserId);
  res.status(201).json({ success: true, data: conversation });
}

async function createGroup(req, res) {
  const { name, description, avatarUrl, participantIds } = req.body;
  const conversation = await conversationsService.createGroupConversation(req.user.id, {
    name, description, avatarUrl, participantIds,
  });
  res.status(201).json({ success: true, data: conversation });
}

async function listMine(req, res) {
  const conversations = await conversationsService.listMyConversations(req.user.id);
  res.status(200).json({ success: true, data: conversations });
}

async function getOne(req, res) {
  const conversation = await conversationsService.getConversationDetail(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: conversation });
}

async function markRead(req, res) {
  const { messageId } = req.body;
  const result = await conversationsService.markConversationRead(req.user.id, req.params.id, messageId);
  res.status(200).json({ success: true, data: result });
}

module.exports = { createDirect, createGroup, listMine, getOne, markRead };
