const { success } = require('../../utils/apiResponse');
const User = require('../../models/User');
const Document = require('../../models/Document');
const SecurityPass = require('../../models/SecurityPass');
const Payment = require('../../models/Payment');

async function dashboardSummary(req, res, next) {
  try {
    const [totalUsers, pendingReviews, activePasses, todayRevenueAgg] = await Promise.all([
      User.countDocuments({ role: 'passenger' }),
      Document.countDocuments({ status: 'ai_uncertain' }),
      SecurityPass.countDocuments({ status: 'active' }),
      Payment.aggregate([
        { $match: { status: 'success', createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return success(res, {
      totalUsers,
      pendingDocumentReviews: pendingReviews,
      activeSecurityPasses: activePasses,
      todayRevenue: todayRevenueAgg[0]?.total || 0,
    }, 'Admin dashboard summary');
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await User.find().select('-passwordHash -refreshTokenHash').sort({ createdAt: -1 });
    return success(res, users, 'Users fetched');
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboardSummary, listUsers };
