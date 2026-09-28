/**
 * passengerJourney.service.js
 *
 * Implements the end-to-end passenger journey state machine described in
 * docs/WORKFLOW.md. This is a read-model / orchestration helper: it does not
 * replace the individual module services (documents, security pass, baggage,
 * payment) but aggregates their state so the frontend can render a single
 * "what's my next step" screen.
 */
const Document = require('../../models/Document');
const SecurityPass = require('../../models/SecurityPass');
const Baggage = require('../../models/Baggage');
const Payment = require('../../models/Payment');
const { DOCUMENT_STATUS } = require('../../utils/constants');

const STEPS = [
  'REGISTER',
  'ADD_FLIGHT',
  'UPLOAD_DOCUMENTS',
  'DOCUMENT_VERIFICATION',
  'SECURITY_PASS',
  'BAGGAGE',
  'PAYMENT',
  'AIRPORT_NAVIGATION',
  'CHECKPOINT',
  'DONE',
];

async function getJourneyState(userId, flightId) {
  const documents = await Document.find({ passenger: userId, flight: flightId });
  const pass = await SecurityPass.findOne({ passenger: userId, flight: flightId }).sort({ createdAt: -1 });
  const baggage = await Baggage.findOne({ passenger: userId, flight: flightId }).sort({ createdAt: -1 });
  const payment = baggage
    ? await Payment.findOne({ baggage: baggage._id }).sort({ createdAt: -1 })
    : null;

  let currentStep = 'ADD_FLIGHT';

  if (documents.length > 0) currentStep = 'UPLOAD_DOCUMENTS';

  const allApproved =
    documents.length > 0 &&
    documents.every(
      (d) => d.status === DOCUMENT_STATUS.AI_APPROVED || d.status === DOCUMENT_STATUS.ADMIN_APPROVED
    );
  const anyUncertainOrPending = documents.some(
    (d) => d.status === DOCUMENT_STATUS.AI_UNCERTAIN || d.status === DOCUMENT_STATUS.OCR_PROCESSED
  );
  const anyRejected = documents.some(
    (d) => d.status === DOCUMENT_STATUS.AI_REJECTED || d.status === DOCUMENT_STATUS.ADMIN_REJECTED
  );

  if (anyRejected) currentStep = 'UPLOAD_DOCUMENTS';
  else if (anyUncertainOrPending) currentStep = 'DOCUMENT_VERIFICATION';
  else if (allApproved) currentStep = 'SECURITY_PASS';

  if (pass && pass.status === 'active') currentStep = 'BAGGAGE';
  if (baggage) currentStep = 'AIRPORT_NAVIGATION';
  if (baggage && baggage.paymentStatus === 'pending' && (!payment || payment.status !== 'success')) {
    currentStep = 'PAYMENT';
  }
  if (pass && pass.status === 'used') currentStep = 'DONE';

  return {
    steps: STEPS,
    currentStep,
    documents,
    securityPass: pass,
    baggage,
    payment,
  };
}

module.exports = { getJourneyState, STEPS };
