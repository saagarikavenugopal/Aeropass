const express = require('express');
const router = express.Router();
const controller = require('./passenger.controller');
const { authenticate } = require('../../middleware/auth');

router.get('/me', authenticate, controller.getProfile);
router.put('/me', authenticate, controller.updateProfile);

module.exports = router;
