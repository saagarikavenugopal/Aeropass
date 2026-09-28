const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    dateOfBirth: { type: Date },
    nationality: { type: String },
    passportNumber: { type: String },
    address: { type: String },
    emergencyContact: {
      name: String,
      phone: String,
    },
    profilePhotoUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Passenger', passengerSchema);
