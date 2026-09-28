const config = require('../../config');

function calculateAllowance(weightKg) {
  const freeAllowanceKg = config.baggage.freeAllowanceKg;
  const excessKg = Math.max(0, weightKg - freeAllowanceKg);
  const excessFee = Math.round(excessKg * config.baggage.excessRatePerKg * 100) / 100;
  return { freeAllowanceKg, excessKg, excessFee, withinLimit: excessKg === 0 };
}

module.exports = { calculateAllowance };
