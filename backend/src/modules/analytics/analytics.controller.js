const { success } = require('../../utils/apiResponse');
const Document = require('../../models/Document');
const SecurityPass = require('../../models/SecurityPass');
const Baggage = require('../../models/Baggage');
const Payment = require('../../models/Payment');

async function documentVerificationStats(req, res, next) {
  try {
    const stats = await Document.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    return success(res, stats, 'Document verification breakdown');
  } catch (err) {
    next(err);
  }
}

async function checkpointThroughput(req, res, next) {
  try {
    const passes = await SecurityPass.find({ 'scans.0': { $exists: true } }).select('scans');
    const scans = passes.flatMap((p) => p.scans);
    const byCheckpoint = scans.reduce((acc, scan) => {
      acc[scan.checkpoint] = (acc[scan.checkpoint] || 0) + 1;
      return acc;
    }, {});
    return success(res, byCheckpoint, 'Checkpoint scan counts');
  } catch (err) {
    next(err);
  }
}

async function revenueStats(req, res, next) {
  try {
    const [baggageStats, paymentStats] = await Promise.all([
      Baggage.aggregate([
        { $group: { _id: null, totalExcessFeeIssued: { $sum: '$excessFee' }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, totalCollected: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
    ]);

    return success(res, {
      totalExcessFeeIssued: baggageStats[0]?.totalExcessFeeIssued || 0,
      totalCollected: paymentStats[0]?.totalCollected || 0,
      successfulPayments: paymentStats[0]?.count || 0,
    }, 'Revenue stats');
  } catch (err) {
    next(err);
  }
}

module.exports = { documentVerificationStats, checkpointThroughput, revenueStats };
