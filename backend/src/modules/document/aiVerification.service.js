const config = require('../../config');

/**
 * AI verification provider abstraction. Compares OCR'd document data against
 * the passenger profile / flight booking and returns approved | uncertain | rejected.
 * Swap AI_VERIFICATION_PROVIDER for a real LLM or fraud-detection call.
 */
async function verifyDocument({ ocrData, passenger, documentType }) {
  if (config.providers.aiVerification === 'stub') {
    const confidence = ocrData?.confidence ?? 0.5;

    let decision = 'uncertain';
    const reasons = [];

    if (confidence >= 0.9) {
      decision = 'approved';
      reasons.push('High OCR confidence and fields matched profile');
    } else if (confidence < 0.6) {
      decision = 'rejected';
      reasons.push('Low OCR confidence — possible tampering or poor scan quality');
    } else {
      decision = 'uncertain';
      reasons.push('Moderate confidence — routed to human review');
    }

    return { decision, score: confidence, reasons, checkedAt: new Date() };
  }

  // Hook point: call Anthropic/OpenAI or a dedicated document-fraud model here.
  throw new Error(`AI verification provider "${config.providers.aiVerification}" not implemented yet`);
}

module.exports = { verifyDocument };
