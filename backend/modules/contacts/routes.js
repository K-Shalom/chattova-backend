// modules/contacts/routes.js
//
// Every route here requires authentication.

const express = require('express');
const contactsController = require('./controller');
const { addContactRules, updateContactRules, contactUserIdParamRule } = require('./validator');
const validate = require('../../common/middleware/validate');
const authenticate = require('../../common/middleware/authenticate');
const asyncHandler = require('../../common/middleware/asyncHandler');

const router = express.Router();

router.use(authenticate);

// GET /api/v1/contacts — list my saved contacts
router.get('/', asyncHandler(contactsController.list));

// POST /api/v1/contacts — save someone as a contact
router.post('/', addContactRules, validate, asyncHandler(contactsController.add));

// PATCH /api/v1/contacts/:contactUserId — update nickname/favorite
router.patch('/:contactUserId', updateContactRules, validate, asyncHandler(contactsController.update));

// DELETE /api/v1/contacts/:contactUserId — remove a contact
router.delete('/:contactUserId', contactUserIdParamRule, validate, asyncHandler(contactsController.remove));

module.exports = router;
