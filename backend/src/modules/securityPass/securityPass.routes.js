const express = require('express');
const router = express.Router();
const controller = require('./securityPass.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const auditLogger = require('../../middleware/auditLogger');

router.post('/', authenticate, auditLogger('SECURITY_PASS_GENERATED'), controller.generatePass);
router.get('/flight/:flightId', authenticate, controller.getMyPass);
router.post(
  '/:id/revoke',
  authenticate,
  authorize('admin'),
  auditLogger('SECURITY_PASS_REVOKED'),
  controller.revokePass
);

module.exports = router;
