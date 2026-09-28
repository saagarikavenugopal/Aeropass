const config = require('../../config');

/**
 * OCR provider abstraction. Set OCR_PROVIDER=tesseract|external in .env to
 * swap this stub for a real implementation without touching the controller.
 */
async function extractText(filePath, documentType) {
  if (config.providers.ocr === 'stub') {
    // Deterministic mock OCR payload so the rest of the pipeline is testable.
    return {
      documentType,
      extractedFields: {
        fullName: 'JANE DOE',
        documentNumber: 'X1234567',
        dateOfBirth: '1990-05-14',
        nationality: 'INDIAN',
        expiryDate: '2032-01-01',
      },
      confidence: 0.94,
      rawTextPreview: '[stub OCR output — replace OCR_PROVIDER for real extraction]',
    };
  }

  // Hook point for a real OCR engine, e.g. Tesseract.js or a cloud OCR API.
  throw new Error(`OCR provider "${config.providers.ocr}" not implemented yet`);
}

module.exports = { extractText };
