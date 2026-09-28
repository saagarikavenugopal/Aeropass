const AuditLog = require('../models/AuditLog');

/**
 * Wrap a route handler to automatically record an audit entry once it completes.
 * Usage: router.post('/', auditLogger('SECURITY_PASS_GENERATED'), controller.generate)
 */
function auditLogger(action) {
  return async (req, res, next) => {
    res.on('finish', async () => {
      try {
        if (res.statusCode < 400) {
          await AuditLog.create({
            action,
            actorId: req.user ? req.user.id : null,
            actorRole: req.user ? req.user.role : 'anonymous',
            targetId: req.params.id || null,
            metadata: { method: req.method, path: req.originalUrl, status: res.statusCode },
          });
        }
      } catch (err) {
        console.error('[audit] failed to write audit log:', err.message);
      }
    });
    next();
  };
}

module.exports = auditLogger;
