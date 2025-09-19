# Yape Code Challenge — Node.js + TypeScript (Event-Driven • Clean Architecture)

Implementation aligned with the official challenge: **Transaction API** + **Anti-Fraud service** using **Kafka** (Redpanda).  
Includes **domain validations**, **repository pattern**, **service layer**, **dependency injection**, **RFC7807 error responses**, **tests**, and **Docker Compose**.

---

## Stack

- **Node 20**, **TypeScript**
- **Express** (Transaction API)
- **KafkaJS** (producer/consumer) + **Redpanda** (Kafka compatible)
- **Zod** (domain validation)
- **Pino** (structured logging)
- **Jest + ts-jest + Supertest** (unit & endpoint tests)
- **Clean/Hexagonal** (ports & adapters), **DI container**, **in-memory repository** (swappable)

---

## Quick Start (Docker)

```bash
docker compose up --build -d

# Health check
curl http://localhost:3000/api/v1/health
# -> { "status": "ok" }
```

> Services:
> - `transaction-service`: http://localhost:3000  
> - `anti-fraud-service`: background consumer  
> - `redpanda`: Kafka broker (internal)

---

## API

### Create Transaction
Approved when `value <= 1000`; Rejected when `value > 1000`.  
Amounts are **integer cents**.

**Request**
```bash
curl -X POST http://localhost:3000/api/v1/transactions   -H "Content-Type: application/json"   -H "Idempotency-Key: optional-key-123"   -d '{
    "accountExternalIdDebit":"11111111-1111-4111-8111-111111111111",
    "accountExternalIdCredit":"22222222-2222-4222-8222-222222222222",
    "tranferTypeId": 1,
    "value": 500
  }'
```

**201 Created**
```json
{ "transactionExternalId": "xxxxxxxxxxxxxxx" }
```

The record starts as `"pending"`. The anti-fraud service consumes `transaction-created`,
decides, and publishes `transaction-status` → API updates the status to `"approved"` or `"rejected"`.

---

### Get Transaction by ID
```bash
curl http://localhost:3000/api/v1/transactions/<transactionExternalId>
```

**200 OK (example)**
```json
{
  "transactionExternalId": "<id>",
  "transactionType": { "name": "1" },
  "transactionStatus": { "name": "approved" },
  "value": 500,
  "createdAt": "2025-09-19T22:15:10.123Z"
}
```

---

### Errors (RFC7807)
- Content-Type: `application/problem+json`

Examples:
- **400 Validation Error** (invalid payload / schema)
- **422 Domain Rule** (e.g., same debit/credit account)
- **404 Not Found**

```json
{
  "type": "https://zod.dev/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": [ /* issues */ ]
}
```

---

## Domain Validation (Zod)

- `accountExternalIdDebit/Credit`: **UUID v4**
- `tranferTypeId`: enum **1 | 2 | 3**
- `value`: **integer cents**, `1..1_000_000` (up to 10,000.00)
- **Rule:** debit and credit accounts must be different

**Idempotency:** Send `Idempotency-Key` header on `POST /transactions` to avoid duplicates (handled in repo).

---

## Local Tests (no Docker required)

```bash
# from repository root
npm i --workspaces
npm --workspace packages/shared run build

npm --workspace services/transaction-service test
npm --workspace services/anti-fraud-service test
```

What’s covered:
- Endpoint creation & retrieval (Kafka mocked)
- Domain validation & rules (UUID, integer cents, account mismatch)
- Anti-fraud decision function (approve/reject boundary)

---

## Architecture

**Clean/Hexagonal**
- **domain/**: validation schemas & value objects
- **application/**: `TransactionService` (use cases, orchestration, events)
- **ports/**: `TransactionRepo`, `MessageBus`
- **infra/**:
  - `InMemoryTransactionRepo` (swappable later for DB)
  - `KafkaBus` (KafkaJS)
- **http/**: minimal controllers + RFC7807 error middleware
- **di/**: tiny DI container to wire Repo + Bus → Service
- **anti-fraud-service**: Kafka consumer with retries/backoff; publishes `transaction-status`

**Event Flow**
```
POST /transactions  -> publish "transaction-created"
anti-fraud-service  -> consume "transaction-created" -> decide -> publish "transaction-status"
transaction-service -> consume "transaction-status" -> update state
```

---

## Configuration

Environment variables (validated):
- `PORT` (default `3000`)
- `KAFKA_BROKERS` (Compose uses `redpanda:9092`)
- `NODE_ENV` (`production` disables pino-pretty transport)

---

## Troubleshooting

- **Windows/PowerShell**: If ports are busy, try `docker compose down -v` and rerun.
- If API returns `ECONNREFUSED`, confirm:
  - `docker compose logs -f transaction-service`
  - Hitting **`/api/v1/health`** at `http://localhost:3000`
- If stuck in `"pending"`, check anti-fraud logs:
  ```bash
  docker compose logs -f anti-fraud-service
  ```


