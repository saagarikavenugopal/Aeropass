# End-to-end passenger workflow

```
Register/Login
      ↓
Add Flight
      ↓
Upload Passport + Visa + Ticket
      ↓
Document Validation
      ├── Invalid → Ask User to Re-upload
      └── Valid
           ↓
     AI Verification
      ┌────┴─────┐
   Approved   Uncertain
      ↓          ↓
      │       Admin Review → Approved
      ↓
  Generate Security Pass
      ↓
  Enter Baggage Details
      ↓
  Check Baggage Allowance
      ┌───────┴────────┐
   Within Limit     Excess Weight → Payment Portal → Payment Success
      ↓                                                      ↓
      └──────────────────────── Continue ────────────────────┘
                           ↓
                   Airport Map/Search
                           ↓
                   Navigate to Gate
                           ↓
                   Scan Security Pass
                           ↓
                     Checkpoint
```

## Step-by-step API calls

1. **Register / Login**
   `POST /api/auth/register` → `POST /api/auth/login` → returns `accessToken`.
2. **Add flight**
   `POST /api/flights` with flight number, airline, dates, terminal/gate.
3. **Upload documents** (repeat per document type: `passport`, `visa`, `ticket`)
   `POST /api/documents/upload` (multipart form, field `file`, plus `type`
   and `flightId`).
4. **Document validation → OCR**
   `POST /api/documents/:id/ocr` — extracts fields, sets status
   `ocr_processed`. If the upload itself is invalid (wrong file type/size),
   `middleware/upload.js` rejects it before this step and the client should
   prompt a re-upload.
5. **AI verification**
   `POST /api/documents/:id/ai-verify` → status becomes one of
   `ai_approved`, `ai_uncertain`, `ai_rejected`.
   - `ai_rejected` → client should prompt re-upload (back to step 3).
   - `ai_uncertain` → falls into the admin queue.
6. **Admin review (only if uncertain)**
   Admin calls `GET /api/documents/review/pending`, then
   `POST /api/documents/review/:id` with `{ decision: "approved" | "rejected" }`.
7. **Generate security pass** (only once all required documents for the
   flight are `ai_approved` or `admin_approved`)
   `POST /api/security-pass` with `{ flightId }` → returns pass with QR code
   data URL.
8. **Enter baggage details**
   `POST /api/baggage` with `{ flightId, weightKg }`.
9. **Check allowance** — computed synchronously inside step 8's response:
   `withinLimit` true/false, `excessFee` amount.
10. **Payment (if excess)**
    `POST /api/payments/baggage` with `{ baggageId }` → charges via
    `gateway.service.js`, updates baggage `paymentStatus` to `paid`.
11. **Airport map / navigation**
    `GET /api/airport-map/locations?type=gate` to search, then
    `GET /api/airport-map/navigate?fromId=...&toId=...` for a route + ETA.
12. **Checkpoint scan**
    Checkpoint officer app calls
    `POST /api/checkpoint/scan` with `{ passCode, checkpointName }` —
    validates and marks the pass `used`, or returns 403 with the failure
    reason (`expired`, `revoked`, `already used`).

At any point, `GET /api/journey/:flightId` returns the passenger's current
step plus the underlying document/pass/baggage/payment records, so a client
can render a single progress screen instead of re-deriving state itself.
