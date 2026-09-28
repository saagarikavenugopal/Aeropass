const { success, failure } = require('../../utils/apiResponse');
const SecurityPass = require('../../models/SecurityPass');
const Document = require('../../models/Document');
const { DOCUMENT_STATUS, SECURITY_PASS_STATUS } = require('../../utils/constants');
const { generatePassCode, generateQrDataUrl } = require('./qrGenerator.service');
const { validatePass } = require('./validation.service');

async function generatePass(req, res, next) {
  try {
    const { flightId } = req.body;

    const documents = await Document.find({ passenger: req.user.id, flight: flightId });
    const allApproved =
      documents.length > 0 &&
      documents.every(
        (d) => d.status === DOCUMENT_STATUS.AI_APPROVED || d.status === DOCUMENT_STATUS.ADMIN_APPROVED
      );

    if (!allApproved) {
      return failure(res, 'All required documents must be approved before a pass can be issued', 422);
    }

    const passCode = await generatePassCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h validity
    const qrCodeDataUrl = await generateQrDataUrl({ passCode, passenger: req.user.id, flightId });

    const pass = await SecurityPass.create({
      passenger: req.user.id,
      flight: flightId,
      passCode,
      qrCodeDataUrl,
      expiresAt,
    });

    return success(res, pass, 'Security pass generated', 201);
  } catch (err) {
    next(err);
  }
}

async function getMyPass(req, res, next) {
  try {
    const pass = await SecurityPass.findOne({
      passenger: req.user.id,
      flight: req.params.flightId,
    }).sort({ createdAt: -1 });
    if (!pass) return failure(res, 'No pass found for this flight', 404);
    return success(res, pass, 'Pass fetched');
  } catch (err) {
    next(err);
  }
}

async function revokePass(req, res, next) {
  try {
    const { reason } = req.body;
    const pass = await SecurityPass.findByIdAndUpdate(
      req.params.id,
      { status: SECURITY_PASS_STATUS.REVOKED, revokedReason: reason || 'Revoked by admin' },
      { new: true }
    );
    if (!pass) return failure(res, 'Pass not found', 404);
    return success(res, pass, 'Pass revoked');
  } catch (err) {
    next(err);
  }
}

async function validatePassByCode(passCode) {
  const pass = await SecurityPass.findOne({ passCode });
  const result = validatePass(pass);
  return { pass, result };
}

module.exports = { generatePass, getMyPass, revokePass, validatePassByCode };
