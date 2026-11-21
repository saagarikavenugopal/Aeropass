const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    baggage: { type: mongoose.Schema.Types.ObjectId, ref: 'Baggage' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    method: { type: String, enum: ['upi', 'cash', 'netbanking', 'card'], default: 'upi' },
    provider: { type: String, default: 'stub' },
    transactionId: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    failureReason: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
