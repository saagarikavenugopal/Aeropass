const jwt = require('jsonwebtoken');
const config = require('../config');

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  const token = match ? match[1].trim() : null;

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ success: false, message: 'Missing access token' });
  }

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    const userId = payload.id || payload._id || payload.userId;
    req.user = {
      ...payload,
      id: userId,
      _id: userId,
    };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function authorize(...allowedRoles) {
  const roles = allowedRoles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };

