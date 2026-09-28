const express = require('express');
const router = express.Router();
const controller = require('./airportMap.controller');
const { authenticate, authorize } = require('../../middleware/auth');

router.get('/locations', controller.listLocations);
router.get('/locations/:id', controller.getLocation);
router.get('/navigate', authenticate, controller.navigate);
router.post('/locations', authenticate, authorize('admin'), controller.createLocation);

module.exports = router;
