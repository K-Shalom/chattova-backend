// modules/blocks/controller.js

const blocksService = require('./service');

async function block(req, res) {
  const result = await blocksService.blockUser(req.user.id, req.body.userId);
  res.status(201).json({ success: true, data: result });
}

async function unblock(req, res) {
  const result = await blocksService.unblockUser(req.user.id, req.params.userId);
  res.status(200).json({ success: true, data: result });
}

async function list(req, res) {
  const blocked = await blocksService.listBlocked(req.user.id);
  res.status(200).json({ success: true, data: blocked });
}

module.exports = { block, unblock, list };
