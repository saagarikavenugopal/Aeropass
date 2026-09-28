const express = require('express');
const router = express.Router();
const controller = require('./admin.controller');
const { authenticate, authorize } = require('../../middleware/auth');

router.use(authenticate, authorize('admin'));
router.get('/dashboard', controller.dashboardSummary);
router.get('/users', controller.listUsers);

module.exports = router;
