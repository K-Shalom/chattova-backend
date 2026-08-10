// routes/index.js
//
// This is the single place that wires every module's routes into the app.
// When we add a new module (e.g. messages), it gets one line here.

const express = require('express');
const authRoutes = require('../modules/auth/routes');
const healthRoutes = require('../modules/health/routes');
const usersRoutes = require('../modules/users/routes');
const conversationsRoutes = require('../modules/conversations/routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/conversations', conversationsRoutes);

// As we build more modules, we add them here, e.g.:
// router.use('/messages', messagesRoutes);

module.exports = router;