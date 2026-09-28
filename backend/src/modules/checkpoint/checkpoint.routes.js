const express = require('express');
const router = express.Router();
const controller = require('./checkpoint.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const auditLogger = require('../../middleware/auditLogger');

router.post(
  '/scan',
  authenticate,
  authorize('checkpoint_officer', 'admin'),
  auditLogger('CHECKPOINT_SCAN'),
  controller.scanPass
);

module.exports = router;
