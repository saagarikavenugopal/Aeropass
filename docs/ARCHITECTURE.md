# Architecture

## Module → folder mapping

| Architecture node          | Backend location                                   |
|-----------------------------|----------------------------------------------------|
| Authentication & User Mgmt  | `backend/src/modules/auth`                          |
| Passenger Profile            | `backend/src/modules/passenger`                     |
| Flight Management             | `backend/src/modules/flight`                        |
| Document Mgmt → Upload        | `backend/src/modules/document/document.controller.js` (`uploadDocument`) |
| Document Mgmt → OCR            | `backend/src/modules/document/ocr.service.js`       |
| Document Mgmt → AI Verification| `backend/src/modules/document/aiVerification.service.js` |
| Document Mgmt → Human Verification | `backend/src/modules/document/humanVerification.controller.js` |
| Security Pass → Generation      | `backend/src/modules/securityPass/securityPass.controller.js` (`generatePass`) |
| Security Pass → QR/Barcode       | `backend/src/modules/securityPass/qrGenerator.service.js` |
| Security Pass → Validation         | `backend/src/modules/securityPass/validation.service.js` |
| Security Pass → Revocation           | `securityPass.controller.js` (`revokePass`) |
| Security Checkpoint → Pass Scanner    | `backend/src/modules/checkpoint` |
| Baggage → Weight Entry                  | `backend/src/modules/baggage/baggage.controller.js` |
| Baggage → Allowance Calculation           | `backend/src/modules/baggage/allowance.service.js` |
| Baggage → Excess Baggage                    | same controller, `excessFee`/`excessKg` fields |
| Payment → Gateway                              | `backend/src/modules/payment/gateway.service.js` |
| Payment → Transactions                           | `Payment` model + `payment.controller.js` |
| Payment → Receipts                                 | `payment.controller.js` (`getReceipt`) |
| Airport Map (terminals/gates/shops/restaurants)      | `backend/src/modules/airportMap` + `AirportLocation` model |
| Airport Map → Navigation                               | `airportMap.controller.js` (`navigate`) |
| Notifications                                            | `backend/src/modules/notifications` |
| Admin Dashboard                                            | `backend/src/modules/admin` |
| Audit & Logging                                              | `backend/src/middleware/auditLogger.js` + `backend/src/modules/audit` |
| Analytics & Monitoring                                         | `backend/src/modules/analytics` |

## Design principles

1. **Module isolation.** Every module owns its `*.routes.js`, `*.controller.js`
   and (where relevant) `*.service.js`. Cross-module reads happen through
   Mongoose models directly (e.g. `securityPass` reads `Document` status) —
   there is no shared business logic layer to keep in sync, which keeps the
   codebase easy for an agent to extend module-by-module.

2. **Pluggable external integrations.** OCR, AI verification, payment, and
   notifications each sit behind one `*.service.js` file gated by an env var
   (`OCR_PROVIDER`, `AI_VERIFICATION_PROVIDER`, `PAYMENT_PROVIDER`,
   `NOTIFICATIONS_PROVIDER`). The `stub` branch is deterministic and safe for
   local dev/demo; add a new branch to wire a real provider.

3. **Everything auditable.** `middleware/auditLogger.js` is attached to every
   state-changing route (document upload/verify, pass generate/revoke,
   checkpoint scan, payment) and writes to the `AuditLog` collection,
   independent of business logic succeeding or failing loudly.

4. **Role-based access control.** Three roles — `passenger`,
   `checkpoint_officer`, `admin` — enforced via `middleware/auth.js`
   (`authenticate` + `authorize(...)`).

5. **Stateless API, statef ul journey view.** The core REST API is stateless;
   `modules/passenger/passengerJourney.service.js` derives "what step is this
   passenger on" by reading current Document/SecurityPass/Baggage/Payment
   records rather than storing a separate journey/session state — so it can
   never drift out of sync with the underlying data.

## Data flow for one request (example: AI document verification)

```
Client
  → POST /api/documents/:id/ai-verify   (auth: passenger JWT)
    → document.controller.runAiVerification
       → aiVerification.service.verifyDocument(ocrData)
       → Document.save() with new status
    → auditLogger writes AuditLog entry
  ← 200 { document }
```
