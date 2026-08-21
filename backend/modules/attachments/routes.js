// modules/attachments/routes.js
//
// mergeParams: true lets this router see :id and :messageId from wherever
// it's mounted (see messages/routes.js). Authentication is already applied
// upstream by the parent conversations router.

const express = require('express');
const attachmentsController = require('./controller');
const { messageParamRules } = require('./validator');
const validate = require('../../common/middleware/validate');
const asyncHandler = require('../../common/middleware/asyncHandler');
const { uploadSingleFile } = require('../../common/middleware/upload');

const router = express.Router({ mergeParams: true });

// POST /api/v1/conversations/:id/messages/:messageId/attachments
router.post('/', messageParamRules, validate, uploadSingleFile('file'), asyncHandler(attachmentsController.upload));

// GET /api/v1/conversations/:id/messages/:messageId/attachments
router.get('/', messageParamRules, validate, asyncHandler(attachmentsController.list));

module.exports = router;
