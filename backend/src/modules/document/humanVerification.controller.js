const { success, failure } = require('../../utils/apiResponse');
const Document = require('../../models/Document');
const { DOCUMENT_STATUS } = require('../../utils/constants');

async function listPendingReview(req, res, next) {
  try {
    const documents = await Document.find({ status: DOCUMENT_STATUS.AI_UNCERTAIN }).populate(
      'passenger',
      'fullName email'
    );
    return success(res, documents, 'Documents pending human review');
  } catch (err) {
    next(err);
  }
}

async function reviewDocument(req, res, next) {
  try {
    const { decision, notes } = req.body; // 'approved' | 'rejected'
    if (!['approved', 'rejected'].includes(decision)) {
      return failure(res, 'decision must be approved or rejected', 422);
    }

    const document = await Document.findById(req.params.id);
    if (!document) return failure(res, 'Document not found', 404);

    document.adminReview = {
      reviewerId: req.user.id,
      decision,
      notes,
      reviewedAt: new Date(),
    };
    document.status =
      decision === 'approved' ? DOCUMENT_STATUS.ADMIN_APPROVED : DOCUMENT_STATUS.ADMIN_REJECTED;
    await document.save();

    return success(res, document, 'Document reviewed');
  } catch (err) {
    next(err);
  }
}

module.exports = { listPendingReview, reviewDocument };
