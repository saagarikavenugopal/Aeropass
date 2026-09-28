const { SECURITY_PASS_STATUS } = require('../../utils/constants');

function validatePass(pass) {
  if (!pass) return { valid: false, reason: 'Pass not found' };
  if (pass.status === SECURITY_PASS_STATUS.REVOKED) return { valid: false, reason: 'Pass revoked' };
  if (pass.status === SECURITY_PASS_STATUS.USED) return { valid: false, reason: 'Pass already used' };
  if (new Date(pass.expiresAt) < new Date()) return { valid: false, reason: 'Pass expired' };
  return { valid: true, reason: 'OK' };
}

module.exports = { validatePass };
