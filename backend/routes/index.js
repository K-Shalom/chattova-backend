// routes/index.js
//
// This is the single place that wires every module's routes into the app.

const express = require('express');
const authRoutes = require('../modules/auth/routes');
const healthRoutes = require('../modules/health/routes');
const usersRoutes = require('../modules/users/routes');
const conversationsRoutes = require('../modules/conversations/routes');
const contactsRoutes = require('../modules/contacts/routes');
const notificationsRoutes = require('../modules/notifications/routes');
const devicesRoutes = require('../modules/devices/routes');
const blocksRoutes = require('../modules/blocks/routes');
const settingsRoutes = require('../modules/settings/routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/conversations', conversationsRoutes);
router.use('/contacts', contactsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/devices', devicesRoutes);
router.use('/blocks', blocksRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
