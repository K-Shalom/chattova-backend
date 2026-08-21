// modules/attachments/controller.js
//
// mergeParams: req.params.id is the conversation id, req.params.messageId
// is the message this file is attached to (see routes.js).

const attachmentsService = require('./service');

async function upload(req, res) {
  const { id: conversationId, messageId } = req.params;
  const attachment = await attachmentsService.uploadAttachment(req.user.id, conversationId, messageId, req.file);
  res.status(201).json({ success: true, data: attachment });
}

async function list(req, res) {
  const { id: conversationId, messageId } = req.params;
  const attachments = await attachmentsService.listForMessage(req.user.id, conversationId, messageId);
  res.status(200).json({ success: true, data: attachments });
}

module.exports = { upload, list };
