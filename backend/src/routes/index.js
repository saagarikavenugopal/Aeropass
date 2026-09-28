const express = require('express');
const router = express.Router();

router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/passengers', require('../modules/passenger/passenger.routes'));
router.use('/flights', require('../modules/flight/flight.routes'));
router.use('/documents', require('../modules/document/document.routes'));
router.use('/security-pass', require('../modules/securityPass/securityPass.routes'));
router.use('/checkpoint', require('../modules/checkpoint/checkpoint.routes'));
router.use('/baggage', require('../modules/baggage/baggage.routes'));
router.use('/payments', require('../modules/payment/payment.routes'));
router.use('/airport-map', require('../modules/airportMap/airportMap.routes'));
router.use('/notifications', require('../modules/notifications/notifications.routes'));
router.use('/admin', require('../modules/admin/admin.routes'));
router.use('/audit', require('../modules/audit/audit.routes'));
router.use('/analytics', require('../modules/analytics/analytics.routes'));

router.get('/health', (req, res) => res.json({ success: true, message: 'API is healthy' }));

// Passenger journey aggregate view (see modules/passenger/passengerJourney.service.js)
router.get('/journey/:flightId', require('../middleware/auth').authenticate, async (req, res, next) => {
  try {
    const { getJourneyState } = require('../modules/passenger/passengerJourney.service');
    const state = await getJourneyState(req.user.id, req.params.flightId);
    res.json({ success: true, message: 'Journey state', data: state });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
