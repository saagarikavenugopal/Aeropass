const { success, failure } = require('../../utils/apiResponse');
const SecurityPass = require('../../models/SecurityPass');
const { SECURITY_PASS_STATUS } = require('../../utils/constants');
const { validatePassByCode } = require('../securityPass/securityPass.controller');

async function scanPass(req, res, next) {
  try {
    const { passCode, checkpointName } = req.body;
    if (!passCode) return failure(res, 'passCode is required', 422);

    const { pass, result } = await validatePassByCode(passCode);

    if (pass) {
      pass.scans.push({
        checkpoint: checkpointName || 'unspecified',
        scannedBy: req.user.id,
        result: result.valid ? 'valid' : result.reason.toLowerCase().replace(/\s+/g, '_'),
      });
      if (result.valid) {
        pass.status = SECURITY_PASS_STATUS.USED;
        pass.usedAt = new Date();
      }
      await pass.save();
    }

    if (!result.valid) {
      return failure(res, `Pass invalid: ${result.reason}`, 403, { passCode });
    }

    return success(res, { pass, checkpointName }, 'Pass validated — passenger cleared');
  } catch (err) {
    next(err);
  }
}

module.exports = { scanPass };
