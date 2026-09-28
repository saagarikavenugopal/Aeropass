const { success, failure } = require('../../utils/apiResponse');
const Document = require('../../models/Document');
const { DOCUMENT_STATUS } = require('../../utils/constants');
const ocrService = require('./ocr.service');
const aiVerificationService = require('./aiVerification.service');

async function uploadDocument(req, res, next) {
  try {
    const { type, flightId } = req.body;
    if (!req.file) return failure(res, 'File is required', 422);
    if (!type) return failure(res, 'Document type is required', 422);

    const document = await Document.create({
      passenger: req.user.id,
      flight: flightId || undefined,
      type,
      fileUrl: `/uploads/${req.file.filename}`,
      status: DOCUMENT_STATUS.UPLOADED,
    });

    return success(res, document, 'Document uploaded', 201);
  } catch (err) {
    next(err);
  }
}

async function runOcr(req, res, next) {
  try {
    const document = await Document.findOne({ _id: req.params.id, passenger: req.user.id });
    if (!document) return failure(res, 'Document not found', 404);

    const ocrData = await ocrService.extractText(document.fileUrl, document.type);
    document.ocrData = ocrData;
    document.status = DOCUMENT_STATUS.OCR_PROCESSED;
    await document.save();

    return success(res, document, 'OCR processed');
  } catch (err) {
    next(err);
  }
}

async function runAiVerification(req, res, next) {
  try {
    const document = await Document.findOne({ _id: req.params.id, passenger: req.user.id });
    if (!document) return failure(res, 'Document not found', 404);
    if (!document.ocrData) return failure(res, 'Run OCR before AI verification', 422);

    const result = await aiVerificationService.verifyDocument({
      ocrData: document.ocrData,
      passenger: req.user.id,
      documentType: document.type,
    });

    document.aiVerification = result;
    document.status =
      result.decision === 'approved'
        ? DOCUMENT_STATUS.AI_APPROVED
        : result.decision === 'rejected'
        ? DOCUMENT_STATUS.AI_REJECTED
        : DOCUMENT_STATUS.AI_UNCERTAIN;
    await document.save();

    return success(res, document, 'AI verification complete');
  } catch (err) {
    next(err);
  }
}

async function listMyDocuments(req, res, next) {
  try {
    const documents = await Document.find({ passenger: req.user.id }).sort({ createdAt: -1 });
    return success(res, documents, 'Documents fetched');
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadDocument, runOcr, runAiVerification, listMyDocuments };
