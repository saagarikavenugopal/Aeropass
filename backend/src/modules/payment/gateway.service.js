const config = require('../../config');
const { v4: uuidv4 } = require('uuid');

/**
 * Payment gateway abstraction. Swap PAYMENT_PROVIDER=stripe (or another
 * provider) and implement the branch below — controllers never change.
 */
async function charge({ amount, currency = 'USD' }) {
  if (config.providers.payment === 'stub') {
    // Simulates a successful charge synchronously for local development/demo.
    return {
      success: true,
      providerTransactionId: `stub_txn_${uuidv4()}`,
      amount,
      currency,
    };
  }

  throw new Error(`Payment provider "${config.providers.payment}" not implemented yet`);
}

module.exports = { charge };
