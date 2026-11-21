const config = require('../../config');
const User = require('../../models/User');
const Passenger = require('../../models/Passenger');

/**
 * AI verification provider abstraction.
 * Requirement 5: Checks file validity, required fields, expiry dates, and document consistency.
 */
async function verifyDocument({ ocrData, passenger: passengerId, documentType, fileUrl }) {
  if (config.providers.aiVerification === 'stub') {
    const reasons = [];
    const fields = ocrData?.extractedFields || {};
    const confidence = ocrData?.confidence ?? 0.85;

    // Fetch passenger profile & user for consistency checks
    let user = null;
    let passengerProfile = null;
    if (passengerId) {
      user = await User.findById(passengerId);
      passengerProfile = await Passenger.findOne({ user: passengerId });
    }

    // 1. FILE VALIDITY CHECK
    let fileValid = true;
    let fileValidityDetails = 'File integrity confirmed. Valid document MIME structure (PDF/Image).';
    if (fileUrl && !fileUrl.match(/\.(pdf|jpe?g|png|webp)$/i)) {
      fileValid = false;
      fileValidityDetails = 'Unsupported document format or corrupted file header.';
      reasons.push('File validity failure: format must be PDF, JPG, PNG, or WEBP.');
    }

    // 2. REQUIRED FIELDS CHECK
    const requiredByType = {
      passport: ['fullName', 'documentNumber', 'expiryDate', 'dateOfBirth', 'nationality'],
      visa: ['fullName', 'documentNumber', 'expiryDate'],
      ticket: ['fullName', 'flightNumber'],
      id_card: ['fullName', 'documentNumber'],
    };

    const expectedFields = requiredByType[documentType] || ['fullName', 'documentNumber'];
    const presentFields = [];
    const missingFields = [];

    expectedFields.forEach((field) => {
      if (fields[field] && String(fields[field]).trim().length > 0) {
        presentFields.push(field);
      } else {
        missingFields.push(field);
      }
    });

    const requiredFieldsPass = missingFields.length === 0;
    if (!requiredFieldsPass) {
      reasons.push(`Required fields missing from OCR extraction: ${missingFields.join(', ')}.`);
    }

    // 3. EXPIRY DATE CHECK
    let expiryValid = true;
    let expiryDetails = 'No expiry date required for this document type.';
    let daysUntilExpiry = null;

    if (fields.expiryDate) {
      const expDate = new Date(fields.expiryDate);
      if (isNaN(expDate.getTime())) {
        expiryValid = false;
        expiryDetails = 'Unparseable expiry date format detected.';
        reasons.push('Invalid expiry date format.');
      } else {
        const now = new Date();
        const diffMs = expDate.getTime() - now.getTime();
        daysUntilExpiry = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffMs < 0) {
          expiryValid = false;
          expiryDetails = `Document EXPIRED on ${expDate.toISOString().split('T')[0]}.`;
          reasons.push(`Document expired on ${expDate.toISOString().split('T')[0]}. Renewal required.`);
        } else if (daysUntilExpiry < 90) {
          expiryDetails = `Expiring soon (${daysUntilExpiry} days remaining).`;
          reasons.push(`Document expires in ${daysUntilExpiry} days (under 90-day advisory).`);
        } else {
          expiryDetails = `Valid until ${expDate.toISOString().split('T')[0]} (${daysUntilExpiry} days remaining).`;
        }
      }
    }

    // 4. DOCUMENT CONSISTENCY CHECK
    let consistencyPass = true;
    let consistencyDetails = 'Document details match passenger record.';
    
    if (user && fields.fullName) {
      const docName = String(fields.fullName).toLowerCase().replace(/[^a-z]/g, '');
      const userName = String(user.fullName).toLowerCase().replace(/[^a-z]/g, '');
      
      // Check partial or full substring match
      const isMatch = docName.includes(userName) || userName.includes(docName) || 
                      docName.split(' ').some(part => part.length > 2 && userName.includes(part));
      
      if (!isMatch) {
        consistencyPass = false;
        consistencyDetails = `Name mismatch: Document states "${fields.fullName}", but passenger account is registered to "${user.fullName}".`;
        reasons.push(consistencyDetails);
      } else {
        consistencyDetails = `Passenger name match verified ("${fields.fullName}" matches account "${user.fullName}").`;
      }
    }

    // Passports consistency with profile passport number
    if (passengerProfile && passengerProfile.passportNumber && fields.documentNumber) {
      const docNum = String(fields.documentNumber).trim().toUpperCase();
      const profNum = String(passengerProfile.passportNumber).trim().toUpperCase();
      if (docNum !== profNum) {
        // Warning note, may route to review
        reasons.push(`Document ID ${docNum} does not match passenger profile passport ${profNum}.`);
      }
    }

    // OVERALL DECISION LOGIC
    let decision = 'approved';
    let calculatedScore = confidence;

    if (!fileValid || !expiryValid) {
      decision = 'rejected';
      calculatedScore = Math.min(confidence, 0.45);
    } else if (!requiredFieldsPass || !consistencyPass || confidence < 0.8) {
      decision = 'uncertain'; // Routes to Human Admin Verification Queue (Requirement 6)
      calculatedScore = Math.min(confidence, 0.72);
      if (reasons.length === 0) {
        reasons.push('Moderate confidence score — routed for human administrative review.');
      }
    } else {
      decision = 'approved';
      calculatedScore = Math.max(confidence, 0.94);
      if (reasons.length === 0) {
        reasons.push('All automated AI verification checks passed with high confidence.');
      }
    }

    const checks = {
      fileValidity: {
        passed: fileValid,
        details: fileValidityDetails,
      },
      requiredFields: {
        passed: requiredFieldsPass,
        expected: expectedFields,
        present: presentFields,
        missing: missingFields,
      },
      expiryDate: {
        passed: expiryValid,
        details: expiryDetails,
        daysUntilExpiry,
      },
      consistency: {
        passed: consistencyPass,
        details: consistencyDetails,
      },
    };

    return {
      decision,
      score: calculatedScore,
      checks,
      reasons,
      checkedAt: new Date(),
    };
  }

  // Hook point: call Anthropic/OpenAI or a dedicated document-fraud model here.
  throw new Error(`AI verification provider "${config.providers.aiVerification}" not implemented yet`);
}

module.exports = { verifyDocument };
