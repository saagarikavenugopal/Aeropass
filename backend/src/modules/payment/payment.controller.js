const { success, failure } = require('../../utils/apiResponse');
const Payment = require('../../models/Payment');
const Baggage = require('../../models/Baggage');
const { PAYMENT_STATUS } = require('../../utils/constants');
const gateway = require('./gateway.service');

async function payForExcessBaggage(req, res, next) {
  try {
    const { baggageId } = req.body;
    const baggage = await Baggage.findOne({ _id: baggageId, passenger: req.user.id });
    if (!baggage) return failure(res, 'Baggage record not found', 404);
    if (baggage.excessFee <= 0) return failure(res, 'No excess fee due for this baggage record', 422);

    const payment = await Payment.create({
      passenger: req.user.id,
      baggage: baggage._id,
      amount: baggage.excessFee,
      status: PAYMENT_STATUS.PENDING,
    });

    const chargeResult = await gateway.charge({ amount: baggage.excessFee });

    payment.status = chargeResult.success ? PAYMENT_STATUS.SUCCESS : PAYMENT_STATUS.FAILED;
    payment.providerTransactionId = chargeResult.providerTransactionId;
    payment.receiptUrl = chargeResult.success
      ? `/api/payments/${payment._id}/receipt`
      : null;
    await payment.save();

    if (chargeResult.success) {
      baggage.paymentStatus = 'paid';
      await baggage.save();
    }

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
