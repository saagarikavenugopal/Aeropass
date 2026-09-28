const { success } = require('../../utils/apiResponse');
const AuditLog = require('../../models/AuditLog');

async function listLogs(req, res, next) {
  try {
    const { action, actorId, limit = 100 } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (actorId) filter.actorId = actorId;

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
    return success(res, logs, 'Audit logs fetched');
  } catch (err) {
    next(err);
  }
}

module.exports = { listLogs };
