const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flightNumber: { type: String, required: true },
    airline: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date },
    terminal: { type: String },
    gate: { type: String },
    seatNumber: { type: String },
    bookingReference: { type: String },
    status: {
      type: String,
      enum: ['scheduled', 'boarding', 'departed', 'cancelled', 'delayed'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flight', flightSchema);
