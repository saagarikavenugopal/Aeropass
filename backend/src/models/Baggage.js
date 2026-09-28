const mongoose = require('mongoose');

const baggageSchema = new mongoose.Schema(
  {
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    weightKg: { type: Number, required: true },
    freeAllowanceKg: { type: Number, required: true },
    excessKg: { type: Number, default: 0 },
    excessFee: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['not_required', 'pending', 'paid'], default: 'not_required' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Baggage', baggageSchema);
