const express = require('express');
const router = express.Router();
const controller = require('./baggage.controller');
const { authenticate } = require('../../middleware/auth');

router.post('/', authenticate, controller.submitBaggage);
router.get('/flight/:flightId', authenticate, controller.getMyBaggage);

module.exports = router;
