# API Specification: Live Scoreboard System

This document defines the complete set of REST and WebSocket APIs for managing and displaying user scores in a real-time leaderboard.

---

## Authentication

All authenticated routes require a valid **JWT token** passed via the `Authorization` header.

**Header Example:**

```
Authorization: Bearer <JWT token>
```

---

## 1. POST /api/v1/score/update

Update the authenticated user’s score.

### Request

**Method:** POST  
**URL:** /api/v1/score/update  
**Auth Required:** Yes  
**Content-Type:** application/json

### Request Body

```json
{
  "scoreDelta": 25
}
```

| Field      | Type | Required | Description            |
| ---------- | ---- | -------- | ---------------------- |
| scoreDelta | int  | Yes      | Must be ≥ 1 and ≤ 1000 |

### Success Response

**Code:** 200 OK

```json
{
  "message": "Score updated successfully",
  "newScore": 1300,
  "top10Changed": true
}
```

### Error Responses

| Code | Meaning             | Example                       |
| ---- | ------------------- | ----------------------------- |
| 400  | Bad Request         | Invalid or missing scoreDelta |
| 401  | Unauthorized        | Missing or invalid token      |
| 429  | Rate Limit Exceeded | Too many requests             |
| 500  | Internal Error      | Server-side failure           |

---

## 2. GET /api/v1/score/top

Get the current top N users by score.

### Request

**Method:** GET  
**URL:** /api/v1/score/top  
**Auth Required:** No (optional)  
**Query Parameters:**

| Name  | Type | Required | Description             |
| ----- | ---- | -------- | ----------------------- |
| limit | int  | No       | Defaults to 10, max 100 |

### Response

```json
{
  "top": [
    { "username": "player1", "score": 2400 },
    { "username": "player2", "score": 2350 }
  ]
}
```

---

## 3. GET /api/v1/score/me

Retrieve the current user’s score.

### Request

**Method:** GET  
**URL:** /api/v1/score/me  
**Auth Required:** Yes

### Response

```json
{
  "userId": 42,
  "username": "myname",
  "score": 780
}
```

---

## 4. GET /api/v1/score/rank

Retrieve the user’s rank in the leaderboard.

### Request

**Method:** GET  
**URL:** /api/v1/score/rank  
**Auth Required:** Yes

### Response

```json
{
  "userId": 42,
  "score": 780,
  "rank": 18
}
```

---

## 5. GET /api/v1/score/history

Retrieve a history of score update events for the authenticated user.

### Request

**Method:** GET  
**URL:** /api/v1/score/history  
**Auth Required:** Yes  
**Query Parameters:**

| Name  | Type | Required | Description         |
| ----- | ---- | -------- | ------------------- |
| limit | int  | Yes      | Default 20, max 100 |

### Response

```json
{
  "history": [
    {
      "id": 1,
      "delta": 50,
      "reason": "daily_bonus",
      "createdAt": "2025-08-04T10:30:00Z"
    }
  ]
}
```

---

## 6. POST /api/v1/ws/token (Optional)

Issue a short-lived WebSocket access token.

### Request

**Method:** POST  
**URL:** /api/v1/ws/token  
**Auth Required:** Yes

### Response

```json
{
  "wsToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

# 📡 WebSocket Events

### Endpoint: `wss://yourdomain.com/ws/scoreboard`

Events sent to all connected clients.

### Event: `TOP_10_UPDATE`

```json
{
  "event": "TOP_10_UPDATE",
  "data": [
    { "username": "player1", "score": 2400 },
    { "username": "player2", "score": 2350 }
  ]
}
```

### Event: `MY_SCORE_UPDATE` (Optional)

Sent only to the user who updated their score.

```json
{
  "event": "MY_SCORE_UPDATE",
  "data": {
    "score": 780,
    "rank": 18
  }
}
```

### Event: `ERROR`

```json
{
  "event": "ERROR",
  "message": "Unauthorized WebSocket connection"
}
```

---

# 🛡️ Rate Limiting

| Endpoint           | Limit                   |
| ------------------ | ----------------------- |
| POST /score/update | 5 requests/second/user  |
| All GET endpoints  | 10 requests/second/user |

---

# Testing Checklist

- Valid token updates score
- Rate limiting enforced
- Top 10 changes trigger WebSocket
- Rank, score, and history are correct per user
