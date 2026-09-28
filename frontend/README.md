# Airport Security & Passenger Platform - Frontend Pages

This frontend provides two dedicated, independent portals tailored for passengers/admins and security checkpoint officers:

---

## 1. Admin & Identity Registration Portal (`Admin.html`)
- **URL**: `http://localhost:5173/Admin.html`
- **Purpose**: Identity enrollment and administration login portal.
- **Key Features**:
  - **Passenger Identity & Registration**: Collects full legal name, international mobile number, primary travel email, Known Traveler Number (KTN / TSA PreCheck), travel clearance classification (SkyPriority, Standard, Diplomatic), and titanium-grade password with entropy meter.
  - **Multi-Step Protocol**:
    - **Step 01 / 02**: Identity profile & credentials.
    - **Step 02 / 02**: ICAO Doc 9303 Passport MRZ OCR capture, simulated 3D facial liveness scan with HUD, and 6-digit cryptographic OTP token validation.
    - **Digital Security Pass Issuance**: Generates holographic boarding pass with QR code, flight info, and turnstile token (`SEC-PASS-98214-ER`).
  - **Staff & Admin Sign In**: Dedicated login tab with one-click demo credentials (`Platform Admin` & `Checkpoint Officer`) that authenticates and routes directly to the Officer Command Centre.

---

## 2. Officer Operations & Turnstile Station (`Officer.html`)
- **URL**: `http://localhost:5173/Officer.html`
- **Purpose**: Dedicated command console for airport security officers and gate turnstile operators.
- **Key Features**:
  - **Admin Command Centre**:
    - **Document Adjudication Queue**: Real-time list of `ai_uncertain` passport/visa uploads with side-by-side inspection modal, one-click Approve (issues pass) and Reject actions.
    - **Security Passes & Revocation**: Searchable register of issued digital passes with live revocation and turnstile lockout.
    - **Flight Manifest Roster**: Passenger directory across flights SK-492, DL-108, AA-772 with baggage weights and biometric status.
    - **Terminal 1 Concourse Map**: Interactive schematic of Concourse A, Security Checkpoint A, Boarding Gates A1 & A2 with walking ETAs.
    - **Compliance Audit Ledger**: Forensic chronologically-sorted audit trail of all security actions.
  - **Gate Turnstile Scanner**:
    - Full-screen optical barcode / QR viewfinder with animated scanning laser.
    - Instant pass verification against authority ledger.
    - Audio-visual feedback: Neon emerald strobe for `ACCESS GRANTED`, crimson alarm for `ACCESS DENIED` (revoked/expired).

---

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

Both portals are available at:
- `http://localhost:5173/Admin.html`
- `http://localhost:5173/Officer.html`
