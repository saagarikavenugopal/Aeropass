# Airport Security & Passenger Platform

A modular backend platform covering the full passenger journey — from registration
to boarding-gate security checkpoint — including document AI verification, digital
security passes, baggage allowance/payment, and an airport navigation map.

This package is a **working code scaffold**: every module in the architecture has
real Express routes/controllers/services (with mocked external integrations —
OCR, AI verification, payment gateway, QR generation) so you can run it end-to-end
locally, then swap in real providers.

---

## 1. Architecture

```
Airport Security & Passenger Platform
│
├── Authentication & User Management
├── Passenger Profile
├── Flight Management
├── Document Management
│   ├── Upload
│   ├── OCR
│   ├── AI Verification
│   └── Human Verification
├── Security Pass
│   ├── Generation
│   ├── QR/Barcode
│   ├── Validation
│   └── Revocation
├── Security Checkpoint
│   └── Pass Scanner
├── Baggage Management
│   ├── Weight Entry
│   ├── Allowance Calculation
│   └── Excess Baggage
├── Payment
│   ├── Payment Gateway
│   ├── Transactions
│   └── Receipts
├── Airport Map
│   ├── Terminals
│   ├── Gates
│   ├── Shops
│   ├── Restaurants
│   └── Navigation
├── Notifications
├── Admin Dashboard
├── Audit & Logging
└── Analytics & Monitoring
```

Each box above maps 1:1 to a folder under `backend/src/modules/`. See
`docs/ARCHITECTURE.md` for the full request/data flow and `docs/ER-DIAGRAM.md`
for the data model.

## 2. End-to-end passenger workflow

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

This exact flow is implemented as an orchestrated state machine in
`backend/src/modules/passenger/passengerJourney.service.js`, and documented in
`docs/WORKFLOW.md`.

## 3. Tech stack

| Layer          | Choice                                   |
|----------------|-------------------------------------------|
| Runtime        | Node.js 20+, Express 4                    |
| Database       | MongoDB (Mongoose ODM)                    |
| Cache/Queue    | Redis (for OTPs, rate limiting, sessions) |
| Auth           | JWT (access + refresh tokens)             |
| File storage   | Local disk (dev) / pluggable S3 adapter   |
| OCR            | Pluggable service — stub + Tesseract hook |
| AI Verification| Pluggable service — stub + LLM hook       |
| QR/Barcode     | `qrcode` npm package                      |
| Payments       | Pluggable gateway — Stripe-shaped stub    |
| Realtime       | Socket.io hook for notifications          |
| Containerized  | Docker + docker-compose                   |

## 4. Getting started

```bash
# 1. Copy env file and adjust secrets
cp .env.example .env

# 2. Start Mongo + Redis + API with Docker
docker compose up --build

# --- OR run without Docker ---
cd backend
npm install
npm run dev
```

The API will be available at `http://localhost:4000`. Health check:
`GET /api/health`.

Seed demo data (admin user, sample flight, sample terminal map):

```bash
cd backend
npm run seed
```

## 5. Project layout

```
airport-security-platform/
├── README.md
├── .env.example
├── docker-compose.yml
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── config/            # env, db connection
│       ├── middleware/        # auth guard, error handler, audit logger, upload
│       ├── models/            # Mongoose schemas
│       ├── routes/            # central route index
│       ├── utils/             # shared response/constants helpers
│       └── modules/
│           ├── auth/
│           ├── passenger/
│           ├── flight/
│           ├── document/          (upload, OCR, AI + human verification)
│           ├── securityPass/      (generation, QR, validation, revocation)
│           ├── checkpoint/        (pass scanner)
│           ├── baggage/           (weight, allowance, excess)
│           ├── payment/           (gateway, transactions, receipts)
│           ├── airportMap/        (terminals, gates, shops, navigation)
│           ├── notifications/
│           ├── admin/
│           ├── audit/
│           └── analytics/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── WORKFLOW.md
│   ├── API.md
│   └── ER-DIAGRAM.md
├── postman/
│   └── Airport-Platform.postman_collection.json
├── frontend/
│   └── README.md          # notes for wiring a client app to this API
└── scripts/
    └── seed.js
```

## 6. Using this with Antigravity

1. Unzip the archive.
2. Open the extracted `airport-security-platform/` folder as a project/workspace.
3. Point your agent at `docs/ARCHITECTURE.md` and `docs/WORKFLOW.md` first — they
   describe intent and data flow so generated code stays consistent with the
   existing module boundaries.
4. Each module folder is self-contained (`*.routes.js`, `*.controller.js`,
   `*.service.js`) so new features can be added module-by-module without
   touching unrelated code.
5. All external integrations (OCR, AI verification, payment, storage) are
   isolated behind a single service file per module — swap the stub
   implementation for a real provider without touching controllers/routes.

## 7. Security notes

- Passwords hashed with bcrypt; JWT access tokens short-lived, refresh tokens
  rotated and stored hashed.
- All document/pass/payment actions are written to the `AuditLog` collection
  via `audit.middleware.js`.
- Role-based access control (`passenger`, `admin`, `checkpoint_officer`) enforced
  in `middleware/auth.js`.
- File uploads are type/size-validated in `middleware/upload.js` before hitting
  OCR.
- This is a scaffold: replace stub secrets, add HTTPS/TLS termination, and run
  a real threat-model pass before any production or airport-facing deployment.
