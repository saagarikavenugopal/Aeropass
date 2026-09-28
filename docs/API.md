# API Reference

Base URL: `http://localhost:4000/api`
Auth: `Authorization: Bearer <accessToken>` (obtained from `/auth/login`)
All responses: `{ success: boolean, message: string, data: any, errors?: any }`

## Auth
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/auth/register` | none | `{ fullName, email, password, phone? }` |
| POST | `/auth/login` | none | `{ email, password }` |
| POST | `/auth/refresh` | none | `{ refreshToken }` |
| GET  | `/auth/me` | passenger+ | — |

## Passengers
| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/passengers/me` | passenger+ | — |
| PUT | `/passengers/me` | passenger+ | `{ dateOfBirth, nationality, passportNumber, address, emergencyContact, phone }` |

## Flights
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/flights` | passenger+ | `{ flightNumber, airline, origin, destination, departureTime, terminal?, gate?, seatNumber?, bookingReference? }` |
| GET  | `/flights` | passenger+ | — |
| GET  | `/flights/:id` | passenger+ | — |
| PUT  | `/flights/:id` | passenger+ | any flight field |

## Documents
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/documents/upload` | passenger+ | multipart: `file`, `type` (`passport`\|`visa`\|`ticket`\|`id_card`), `flightId?` |
| POST | `/documents/:id/ocr` | passenger+ | — |
| POST | `/documents/:id/ai-verify` | passenger+ | — |
| GET  | `/documents` | passenger+ | — |
| GET  | `/documents/review/pending` | admin | — |
| POST | `/documents/review/:id` | admin | `{ decision: "approved"\|"rejected", notes? }` |

## Security Pass
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/security-pass` | passenger+ | `{ flightId }` |
| GET  | `/security-pass/flight/:flightId` | passenger+ | — |
| POST | `/security-pass/:id/revoke` | admin | `{ reason? }` |

## Checkpoint
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/checkpoint/scan` | checkpoint_officer, admin | `{ passCode, checkpointName? }` |

## Baggage
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/baggage` | passenger+ | `{ flightId, weightKg }` |
| GET  | `/baggage/flight/:flightId` | passenger+ | — |

## Payments
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/payments/baggage` | passenger+ | `{ baggageId }` |
| GET  | `/payments/:id/receipt` | passenger+ | — |
| GET  | `/payments` | passenger+ | — |

## Airport Map
| Method | Path | Auth | Query/Body |
|---|---|---|---|
| GET  | `/airport-map/locations` | none | `?type=&terminal=&search=` |
| GET  | `/airport-map/locations/:id` | none | — |
| GET  | `/airport-map/navigate` | passenger+ | `?fromId=&toId=` |
| POST | `/airport-map/locations` | admin | `{ type, name, terminal, coordinates:{x,y}, description?, tags? }` |

## Notifications
| Method | Path | Auth | Body |
|---|---|---|---|
| GET  | `/notifications` | passenger+ | — |
| POST | `/notifications/:id/read` | passenger+ | — |

## Admin
| Method | Path | Auth |
|---|---|---|
| GET | `/admin/dashboard` | admin |
| GET | `/admin/users` | admin |

## Audit
| Method | Path | Auth | Query |
|---|---|---|---|
| GET | `/audit` | admin | `?action=&actorId=&limit=` |

## Analytics
| Method | Path | Auth |
|---|---|---|
| GET | `/analytics/documents` | admin |
| GET | `/analytics/checkpoints` | admin |
| GET | `/analytics/revenue` | admin |

## Journey (aggregate)
| Method | Path | Auth |
|---|---|---|
| GET | `/journey/:flightId` | passenger+ |

Returns `{ steps, currentStep, documents, securityPass, baggage, payment }` —
see `docs/WORKFLOW.md` for what each `currentStep` value means.
