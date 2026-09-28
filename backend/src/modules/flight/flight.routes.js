const express = require('express');
const router = express.Router();
const controller = require('./flight.controller');
const { authenticate } = require('../../middleware/auth');

router.post('/', authenticate, controller.addFlight);
router.get('/', authenticate, controller.listMyFlights);
router.get('/:id', authenticate, controller.getFlight);
router.put('/:id', authenticate, controller.updateFlight);

module.exports = router;
