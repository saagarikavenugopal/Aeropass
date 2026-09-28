const express = require('express');
const router = express.Router();
const controller = require('./analytics.controller');
const { authenticate, authorize } = require('../../middleware/auth');

router.use(authenticate, authorize('admin'));
router.get('/documents', controller.documentVerificationStats);
router.get('/checkpoints', controller.checkpointThroughput);
router.get('/revenue', controller.revenueStats);

module.exports = router;
