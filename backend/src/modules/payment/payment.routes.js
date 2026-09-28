const express = require('express');
const router = express.Router();
const controller = require('./payment.controller');
const { authenticate } = require('../../middleware/auth');
const auditLogger = require('../../middleware/auditLogger');

router.post('/baggage', authenticate, auditLogger('PAYMENT_ATTEMPTED'), controller.payForExcessBaggage);
router.get('/:id/receipt', authenticate, controller.getReceipt);
router.get('/', authenticate, controller.listMyTransactions);

module.exports = router;
