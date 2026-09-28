# Data model (ER overview)

```mermaid
erDiagram
    USER ||--o| PASSENGER : "has profile"
    USER ||--o{ FLIGHT : "books"
    USER ||--o{ DOCUMENT : "uploads"
    USER ||--o{ SECURITY_PASS : "holds"
    USER ||--o{ BAGGAGE : "declares"
    USER ||--o{ PAYMENT : "makes"
    USER ||--o{ NOTIFICATION : "receives"

    FLIGHT ||--o{ DOCUMENT : "required for"
    FLIGHT ||--o{ SECURITY_PASS : "issued for"
    FLIGHT ||--o{ BAGGAGE : "checked in for"

    BAGGAGE ||--o| PAYMENT : "excess fee paid via"

    SECURITY_PASS ||--o{ SCAN : "scanned at checkpoints"

    USER {
        ObjectId id
        string fullName
        string email
        string passwordHash
        string role
    }
    PASSENGER {
        ObjectId user
        date dateOfBirth
        string nationality
        string passportNumber
    }
    FLIGHT {
        ObjectId id
        string flightNumber
        string origin
        string destination
        date departureTime
        string status
    }
    DOCUMENT {
        ObjectId id
        string type
        string fileUrl
        object ocrData
        object aiVerification
        object adminReview
        string status
    }
    SECURITY_PASS {
        ObjectId id
        string passCode
        string qrCodeDataUrl
        string status
        date expiresAt
    }
    BAGGAGE {
        ObjectId id
        number weightKg
        number freeAllowanceKg
        number excessKg
        number excessFee
    }
    PAYMENT {
        ObjectId id
        number amount
        string status
        string providerTransactionId
    }
    AIRPORT_LOCATION {
        ObjectId id
        string type
        string name
        string terminal
        object coordinates
    }
    AUDIT_LOG {
        ObjectId id
        string action
        ObjectId actorId
        object metadata
    }
```

Notes:
- `AIRPORT_LOCATION` and `AUDIT_LOG` are standalone collections (not tied to a
  single flight/user) and are omitted from the relationship arrows above for
  clarity.
- `SCAN` is an embedded sub-document array on `SECURITY_PASS.scans`, not a
  separate collection.
