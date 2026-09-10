# API Documentation

Base URL (local): `http://localhost:5001/api`
Base URL (production): `https://expense-tracker-api-gf5r.onrender.com/api`

All protected routes require a header:
```
Authorization: Bearer <jwt_token>
```

Admin-only routes additionally require the authenticated user's `role` to be `ADMIN` — enforced server-side, not by the client.

---

## Auth

### Register
`POST /auth/register`
Rate limited: 10 requests / 15 min.

**Body**
```json
{ "name": "Chung chai", "email": "chai@example.com", "password": "min6chars" }
```

**Response `201`**
```json
{ "id": "uuid", "name": "Chung chai", "email": "chai@example.com", "role": "USER" }
```
Does **not** log the user in — they're redirected to login after successful registration.
Active system categories are automatically copied into the new user's category list.

---

### Login
`POST /auth/login`
Rate limited: 10 requests / 15 min.

**Body**
```json
{ "email": "chai@example.com", "password": "min6chars" }
```

**Response `200`**
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": "uuid", "name": "Chung chai", "email": "chai@example.com", "role": "USER" }
}
```

---

### Get current user
`GET /auth/me` — protected

**Response `200`**
```json
{ "id": "uuid", "name": "Chung chai", "email": "chai@example.com", "role": "USER", "createdAt": "..." }
```

---

### Update profile
`PUT /auth/me` — protected

**Body**
```json
{ "name": "Chung C.", "email": "jane2@example.com" }
```

---

### Change password
`PUT /auth/change-password` — protected

**Body**
```json
{ "currentPassword": "old", "newPassword": "new123" }
```

---

### Forgot password
`POST /auth/forgot-password`
Rate limited: 3 requests / hour.

**Body**
```json
{ "email": "chai@example.com" }
```

**Response `200`** (always returns the same message, regardless of whether the email exists, to avoid leaking registered emails)
```json
{ "message": "If that email exists, a reset link has been sent." }
```
Sends an email (via Resend) containing a link to `{CLIENT_URL}/reset-password/{token}`. Token expires in 1 hour.

---

### Reset password
`PUT /auth/reset-password/:token`

**Body**
```json
{ "newPassword": "newpass123" }
```

**Response `200`**
```json
{ "message": "Password reset successfully" }
```
Returns `400` if the token is invalid or expired. Token is single-use — cleared after a successful reset.

---

## Categories (user-owned)

### List categories
`GET /categories` — protected

### Create category
`POST /categories` — protected
```json
{ "name": "Food", "color": "#E8B4A0" }
```

### Update category
`PUT /categories/:id` — protected

### Delete category
`DELETE /categories/:id` — protected

---

## Transactions (Expenses)

Route prefix is `/expenses` (unchanged internally — labeled "Transactions" in the UI since it covers both expense and income entries).

### List transactions
`GET /expenses` — protected

**Query params** (all optional)
| Param | Type | Description |
|---|---|---|
| `categoryId` | string | Filter by category |
| `from` | date | Start of date range |
| `to` | date | End of date range |
| `type` | `EXPENSE` \| `INCOME` | Filter by type |

### Create transaction
`POST /expenses` — protected
```json
{ "amount": 500, "description": "Groceries", "type": "EXPENSE", "categoryId": "uuid", "date": "2026-09-10" }
```
`amount` must be between 0.01 and 10,000,000.

### Update transaction
`PUT /expenses/:id` — protected

### Delete transaction
`DELETE /expenses/:id` — protected

### Export as CSV
`GET /expenses/export` — protected
Accepts the same query params as the list endpoint (filters carry over to the export). Returns a downloadable `.csv` file with columns: Date, Description, Category, Type, Amount.

---

## Budgets

### List budgets
`GET /budgets` — protected

**Query params:** `month`, `year` (optional)

### Create budget
`POST /budgets` — protected
```json
{ "month": 9, "year": 2026, "limitAmount": 5000, "categoryId": "uuid" }
```
`categoryId` is optional — omit for an "overall" (non-category-specific) budget. `limitAmount` must be between 1 and 10,000,000.

### Update budget
`PUT /budgets/:id` — protected

### Delete budget
`DELETE /budgets/:id` — protected

---

## Dashboard

### Monthly summary
`GET /dashboard/summary` — protected

**Response `200`**
```json
{
  "income": 25000,
  "expenses": 3800,
  "netSavings": 21200,
  "totalBudget": 8500,
  "remainingBudget": 4700,
  "categoryBreakdown": [{ "name": "Food", "amount": 500 }],
  "recentExpenses": [ /* last 5 transactions */ ]
}
```
Scoped to the current calendar month.

### 6-month trend
`GET /dashboard/trend` — protected

**Response `200`**
```json
[
  { "month": "Apr", "income": 20000, "expenses": 4200 },
  { "month": "May", "income": 21000, "expenses": 3900 }
]
```

---

## Admin

All routes below require `role: ADMIN`. Non-admin users receive `403 Forbidden`.

### List all users
`GET /admin/users`

**Response `200`**
```json
[
  {
    "id": "uuid",
    "name": "Chung chai",
    "email": "chai@example.com",
    "role": "USER",
    "createdAt": "...",
    "_count": { "expenses": 12, "budgets": 3, "categories": 5 }
  }
]
```

### System stats
`GET /admin/stats`
```json
{ "totalUsers": 5, "totalExpenses": 42, "totalBudgets": 8, "totalTracked": 13050 }
```

### Update a user's role
`PUT /admin/users/:id/role`
```json
{ "role": "ADMIN" }
```
Logged to the audit log.

### List system categories
`GET /admin/categories`

### Create system category
`POST /admin/categories`
```json
{ "name": "Healthcare" }
```
Immediately propagated to every existing user who doesn't already have a category with that name.

### Toggle (activate/deactivate) a system category
`PUT /admin/categories/:id/toggle`
Deactivating removes the category from any user's personal list where it isn't attached to an existing expense or budget; category data on existing transactions is preserved.

### Delete a system category
`DELETE /admin/categories/:id`
Removes it from the admin's master list only — does not retroactively remove it from users.

### Activity log
`GET /admin/activity`
Returns the 50 most recent audit log entries, newest first.

---

## Error Response Format

All errors follow the same shape:
```json
{ "error": "Human-readable message" }
```

**Common status codes**
| Code | Meaning |
|---|---|
| `400` | Bad request — missing/invalid fields |
| `401` | Missing, invalid, or expired token |
| `403` | Authenticated, but insufficient role |
| `404` | Resource not found (or not owned by the requester) |
| `409` | Conflict (e.g. duplicate email or category name) |
| `429` | Rate limit exceeded |
| `500` | Server error |
