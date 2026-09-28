const express = require('express');
const router = express.Router();
const controller = require('./notifications.controller');
const { authenticate } = require('../../middleware/auth');

router.get('/', authenticate, controller.listMyNotifications);
router.post('/:id/read', authenticate, controller.markRead);

module.exports = router;
