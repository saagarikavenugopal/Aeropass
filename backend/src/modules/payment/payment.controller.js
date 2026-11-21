const { success, failure } = require('../../utils/apiResponse');
const Payment = require('../../models/Payment');
const Baggage = require('../../models/Baggage');
const { PAYMENT_STATUS } = require('../../utils/constants');
const gateway = require('./gateway.service');

async function payForExcessBaggage(req, res, next) {
  try {
    const { baggageId, method = 'upi', paymentDetails = {} } = req.body;
    const baggage = await Baggage.findOne({ _id: baggageId, passenger: req.user.id });
    if (!baggage) return failure(res, 'Baggage record not found', 404);
    if (baggage.excessFee <= 0) return failure(res, 'No excess fee due for this baggage record', 422);

    const txnId = `txn_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const payment = await Payment.create({
      passenger: req.user.id,
      baggage: baggage._id,
      amount: baggage.excessFee,
      currency: 'INR',
      method: ['upi', 'cash', 'netbanking', 'card'].includes(method) ? method : 'upi',
      transactionId: txnId,
      status: 'pending',
    });

    const chargeResult = await gateway.charge({ amount: baggage.excessFee, currency: 'INR', method });

    payment.status = chargeResult.success ? 'completed' : 'failed';
    payment.providerTransactionId = chargeResult.providerTransactionId || txnId;
    payment.receiptUrl = chargeResult.success
      ? `/api/payments/${payment._id}/receipt`
      : null;
    await payment.save();

    if (chargeResult.success) {
      baggage.paymentStatus = 'paid';
      await baggage.save();
    }

    try {
      const { notify } = require('../notifications/notifications.service');
      const methodLabel = method === 'upi' ? 'UPI' : method === 'cash' ? 'Cash Counter Desk' : method === 'netbanking' ? 'NetBanking' : 'Card';
      await notify(req.user.id, {
        title: chargeResult.success ? 'Payment Successful' : 'Payment Failed',
        message: chargeResult.success
          ? `Excess baggage payment of ₹${baggage.excessFee} was successful via ${methodLabel}. Transaction ID: ${payment.providerTransactionId}. Receipt generated.`
          : 'Payment processing was declined. Please verify your payment method.',
        type: chargeResult.success ? 'success' : 'alert',
      });
    } catch (e) {}

    return success(res, payment, chargeResult.success ? 'Payment successful' : 'Payment failed');
  } catch (err) {
    next(err);
  }
}

async function getReceipt(req, res, next) {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, passenger: req.user.id });
    if (!payment) return failure(res, 'Payment not found', 404);

    // In production this would render/stream a PDF receipt.
    return success(res, {
      receiptId: payment._id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      transactionId: payment.providerTransactionId,
      issuedAt: payment.createdAt,
    }, 'Receipt');
  } catch (err) {
    next(err);
  }
}

async function listMyTransactions(req, res, next) {
  try {
    const payments = await Payment.find({ passenger: req.user.id }).sort({ createdAt: -1 });
    return success(res, payments, 'Transactions fetched');
  } catch (err) {
    next(err);
  }
}

module.exports = { payForExcessBaggage, getReceipt, listMyTransactions };
