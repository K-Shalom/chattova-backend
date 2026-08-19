// modules/contacts/controller.js

const contactsService = require('./service');

async function add(req, res) {
  const { contactUserId, nickname } = req.body;
  const contact = await contactsService.addContact(req.user.id, contactUserId, nickname);
  res.status(201).json({ success: true, data: contact });
}

async function remove(req, res) {
  const result = await contactsService.removeContact(req.user.id, req.params.contactUserId);
  res.status(200).json({ success: true, data: result });
}

async function update(req, res) {
  const { nickname, favorite } = req.body;
  const contact = await contactsService.updateContact(req.user.id, req.params.contactUserId, { nickname, favorite });
  res.status(200).json({ success: true, data: contact });
}

async function list(req, res) {
  const contacts = await contactsService.listContacts(req.user.id);
  res.status(200).json({ success: true, data: contacts });
}

module.exports = { add, remove, update, list };
