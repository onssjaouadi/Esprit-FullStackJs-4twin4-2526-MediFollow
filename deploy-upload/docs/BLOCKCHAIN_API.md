# Blockchain API Endpoints Documentation

## Overview

These API endpoints provide optimized access to blockchain transaction data, statistics, and history. All endpoints require authentication with ADMIN or AUDITOR role.

## Endpoints

### 1. GET `/api/blockchain/transactions`

Fetch paginated blockchain transactions with optional filters.

**Query Parameters:**

- `skip` (number, default: 0) - Number of records to skip for pagination
- `take` (number, default: 20) - Number of records to return (max: 100)
- `action` (string, optional) - Filter by action type (GRANT_ACCESS, REVOKE_ACCESS, ACCESS_VERIFY, LOG_ACCESS, WALLET_CREATED, ERROR)
- `userId` (string, optional) - Filter by user ID
- `dateFrom` (ISO string, optional) - Filter from date (inclusive)
- `dateTo` (ISO string, optional) - Filter to date (inclusive)

**Response:**

```json
{
  "data": [
    {
      "id": "string",
      "action": "GRANT_ACCESS",
      "userId": "string",
      "userName": "string",
      "entityId": "string",
      "entityType": "string",
      "transactionHash": "string",
      "gasUsed": "number (optional)",
      "status": "string",
      "createdAt": "ISO string"
    }
  ],
  "total": "number",
  "skip": "number",
  "take": "number"
}
```

**Cache:** 1 minute (s-maxage=60)

**Example:**

```
GET /api/blockchain/transactions?skip=0&take=20&action=GRANT_ACCESS&dateFrom=2026-01-01
```

---

### 2. GET `/api/blockchain/stats`

Get enriched blockchain statistics including real-time Aptos data.

**Query Parameters:** None

**Response:**

```json
{
  "totalGrants": "number",
  "totalRevokes": "number",
  "totalWallets": "number",
  "totalErrors": "number",
  "successRate": "number (percentage)",
  "lastAptosDetails": {
    "hash": "string",
    "status": "string",
    "gasUsed": "number",
    "maxGas": "number",
    "gasPrice": "number",
    "sender": "string",
    "timestamp": "number"
  }
}
```

**Cache:** 2 minutes (s-maxage=120)

**Example:**

```
GET /api/blockchain/stats
```

---

### 3. GET `/api/blockchain/history`

Get monthly blockchain statistics for trend analysis.

**Query Parameters:**

- `months` (number, default: 12) - Number of months to retrieve (1-60)

**Response:**

```json
{
  "monthlyStats": [
    {
      "month": "2026-03",
      "grants": "number",
      "revokes": "number",
      "verifications": "number",
      "wallets": "number",
      "errors": "number",
      "total": "number"
    }
  ],
  "totals": {
    "grants": "number",
    "revokes": "number",
    "verifications": "number",
    "wallets": "number",
    "errors": "number",
    "total": "number"
  }
}
```

**Cache:** 5 minutes (s-maxage=300)

**Example:**

```
GET /api/blockchain/history?months=12
```

---

### 4. GET `/api/blockchain/export`

Export blockchain transactions as CSV file.

**Query Parameters:**

- `action` (string, optional) - Filter by action type
- `userId` (string, optional) - Filter by user ID
- `dateFrom` (ISO string, optional) - Filter from date
- `dateTo` (ISO string, optional) - Filter to date

**Response:** CSV file with columns:

- Timestamp
- Action
- User
- Entity Type
- Transaction Hash
- Gas Used
- Status

**Cache:** No cache (no-cache, no-store, must-revalidate)

**Example:**

```
GET /api/blockchain/export?action=GRANT_ACCESS&dateFrom=2026-01-01&dateTo=2026-03-31
```

---

## Authentication

All endpoints require:

1. Valid session with authenticated user
2. User role must be ADMIN or AUDITOR
3. Returns 401 Unauthorized if role check fails

## Error Handling

All endpoints return error responses in this format:

```json
{
  "error": "Error message description"
}
```

**Status Codes:**

- `200 OK` - Success
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Missing or invalid authentication
- `500 Internal Server Error` - Server error

## Performance Considerations

### Caching Strategy

- **Transactions:** 1 minute cache - Balance between freshness and performance
- **Stats:** 2 minutes cache - Allows UI to update stats without overwhelming server
- **History:** 5 minutes cache - Monthly aggregates change less frequently
- **Export:** No cache - Ensures latest data in downloads

### Best Practices

1. Use pagination with `skip` and `take` for large datasets
2. Filter by date range to reduce result set size
3. Reuse cached data when possible (check Cache-Control headers)
4. For real-time requirements, use `/api/blockchain/stats` (freshest Aptos data)

## Frontend Integration Examples

### React Hook Example

```typescript
const fetchTransactions = async (skip = 0, action?: string) => {
  const params = new URLSearchParams({
    skip: skip.toString(),
    take: "20",
  });
  if (action) params.append("action", action);

  const response = await fetch(`/api/blockchain/transactions?${params}`);
  const data = await response.json();
  return data;
};

// Usage
const transactions = await fetchTransactions(0, "GRANT_ACCESS");
```

### Export Example

```typescript
const exportData = async (dateFrom?: string, dateTo?: string) => {
  const params = new URLSearchParams();
  if (dateFrom) params.append("dateFrom", dateFrom);
  if (dateTo) params.append("dateTo", dateTo);

  window.location.href = `/api/blockchain/export?${params}`;
};

// Usage
exportData("2026-01-01", "2026-03-31");
```

## Version History

- **v1.0** (2026-04-10) - Initial release with 4 endpoints
