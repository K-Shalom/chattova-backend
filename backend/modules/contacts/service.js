// modules/contacts/service.js

const AppError = require('../../common/errors/AppError');
const usersRepository = require('../users/repository');
const { toContact } = require('./dto');
const contactsRepository = require('./repository');

async function addContact(currentUserId, contactUserId, nickname) {
  if (currentUserId === contactUserId) {
    throw new AppError('You cannot add yourself as a contact.', 422, 'INVALID_CONTACT');
  }

  const targetUser = await usersRepository.findById(contactUserId);
  if (!targetUser) {
    throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
  }

  await contactsRepository.addContact(currentUserId, contactUserId, nickname || null);

  const [saved] = await contactsRepository.listContacts(currentUserId).then(
    (rows) => rows.filter((r) => r.contact_user_id === contactUserId)
  );
  return toContact(saved);
}

async function removeContact(currentUserId, contactUserId) {
  await contactsRepository.removeContact(currentUserId, contactUserId);
  return { userId: contactUserId, removed: true };
}

async function updateContact(currentUserId, contactUserId, { nickname, favorite }) {
  const existing = await contactsRepository.findContact(currentUserId, contactUserId);
  if (!existing) {
    throw new AppError('Contact not found.', 404, 'CONTACT_NOT_FOUND');
  }

  await contactsRepository.updateContact(currentUserId, contactUserId, { nickname, favorite });

  const rows = await contactsRepository.listContacts(currentUserId);
  const updated = rows.find((r) => r.contact_user_id === contactUserId);
  return toContact(updated);
}

async function listContacts(currentUserId) {
  const rows = await contactsRepository.listContacts(currentUserId);
  return rows.map(toContact);
}

module.exports = { addContact, removeContact, updateContact, listContacts };
