const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../utils/constants');

const paymentSchema = new mongoose.Schema(
  {
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    baggage: { type: mongoose.Schema.Types.ObjectId, ref: 'Baggage' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    provider: { type: String, default: 'stub' },
    providerTransactionId: { type: String },
    status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
