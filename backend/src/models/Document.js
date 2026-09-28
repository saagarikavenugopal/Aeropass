const mongoose = require('mongoose');
const { DOCUMENT_TYPES, DOCUMENT_STATUS } = require('../utils/constants');

const documentSchema = new mongoose.Schema(
  {
    passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
    type: { type: String, enum: DOCUMENT_TYPES, required: true },
    fileUrl: { type: String, required: true },
    ocrData: { type: mongoose.Schema.Types.Mixed, default: null },
    aiVerification: {
      score: { type: Number, default: null },
      decision: { type: String, default: null }, // approved | uncertain | rejected
      reasons: [{ type: String }],
      checkedAt: { type: Date },
    },
    adminReview: {
      reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      decision: { type: String }, // approved | rejected
      notes: { type: String },
      reviewedAt: { type: Date },
    },
    status: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.UPLOADED,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
