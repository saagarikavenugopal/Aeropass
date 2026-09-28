module.exports = {
  ROLES: {
    PASSENGER: 'passenger',
    ADMIN: 'admin',
    CHECKPOINT_OFFICER: 'checkpoint_officer',
  },
  DOCUMENT_TYPES: ['passport', 'visa', 'ticket', 'id_card'],
  DOCUMENT_STATUS: {
    UPLOADED: 'uploaded',
    OCR_PROCESSED: 'ocr_processed',
    AI_APPROVED: 'ai_approved',
    AI_UNCERTAIN: 'ai_uncertain',
    AI_REJECTED: 'ai_rejected',
    ADMIN_APPROVED: 'admin_approved',
    ADMIN_REJECTED: 'admin_rejected',
  },
  SECURITY_PASS_STATUS: {
    ACTIVE: 'active',
    USED: 'used',
    REVOKED: 'revoked',
    EXPIRED: 'expired',
  },
  PAYMENT_STATUS: {
    PENDING: 'pending',
    SUCCESS: 'success',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },
};
