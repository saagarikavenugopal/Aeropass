const express = require('express');
const router = express.Router();
const controller = require('./audit.controller');
const { authenticate, authorize } = require('../../middleware/auth');

router.get('/', authenticate, authorize('admin'), controller.listLogs);

module.exports = router;
