const express = require('express');
const router = express.Router();
const controller = require('./document.controller');
const humanReview = require('./humanVerification.controller');
const { authenticate, authorize } = require('../../middleware/auth');
const upload = require('../../middleware/upload');
const auditLogger = require('../../middleware/auditLogger');

// Passenger-facing
router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  auditLogger('DOCUMENT_UPLOADED'),
  controller.uploadDocument
);
router.post('/:id/ocr', authenticate, controller.runOcr);
router.post('/:id/ai-verify', authenticate, auditLogger('DOCUMENT_AI_VERIFIED'), controller.runAiVerification);
router.get('/', authenticate, controller.listMyDocuments);

// Admin-facing human verification queue
router.get('/review/pending', authenticate, authorize('admin'), humanReview.listPendingReview);
router.post(
  '/review/:id',
  authenticate,
  authorize('admin'),
  auditLogger('DOCUMENT_HUMAN_REVIEWED'),
  humanReview.reviewDocument
);

module.exports = router;
