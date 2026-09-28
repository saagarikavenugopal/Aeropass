const { success, failure } = require('../../utils/apiResponse');
const Baggage = require('../../models/Baggage');
const { calculateAllowance } = require('./allowance.service');

async function submitBaggage(req, res, next) {
  try {
    const { flightId, weightKg } = req.body;
    if (!flightId || weightKg == null) {
      return failure(res, 'flightId and weightKg are required', 422);
    }

    const { freeAllowanceKg, excessKg, excessFee, withinLimit } = calculateAllowance(weightKg);

    const baggage = await Baggage.create({
      passenger: req.user.id,
      flight: flightId,
      weightKg,
      freeAllowanceKg,
      excessKg,
      excessFee,
      paymentStatus: withinLimit ? 'not_required' : 'pending',
    });

    return success(
      res,
      baggage,
      withinLimit ? 'Baggage within free allowance' : 'Excess baggage — payment required',
      201
    );
  } catch (err) {
    next(err);
  }
}

async function getMyBaggage(req, res, next) {
  try {
    const baggage = await Baggage.findOne({
      passenger: req.user.id,
      flight: req.params.flightId,
    }).sort({ createdAt: -1 });
    if (!baggage) return failure(res, 'No baggage record found for this flight', 404);
    return success(res, baggage, 'Baggage fetched');
  } catch (err) {
    next(err);
  }
}

module.exports = { submitBaggage, getMyBaggage };
