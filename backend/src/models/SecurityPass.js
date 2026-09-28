const mongoose = require('mongoose');
const { SECURITY_PASS_STATUS } = require('../utils/constants');

const securityPassSchema = new mongoose.Schema(
  {
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    passCode: { type: String, required: true, unique: true },
    qrCodeDataUrl: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(SECURITY_PASS_STATUS),
      default: SECURITY_PASS_STATUS.ACTIVE,
    },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
    revokedReason: { type: String },
    scans: [
      {
        checkpoint: String,
        scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        result: String, // valid | invalid | expired | revoked
        scannedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('SecurityPass', securityPassSchema);
