# Expense Tracker API

REST API for the Expense Tracker application.

The backend is built with **Node.js, Express.js, Prisma ORM, and JWT authentication**.

## Base URL

### Local

```text
http://localhost:5000/api
```

### Production

```text
https://<your-backend-domain>/api
```

Replace the production URL with the deployed backend URL when available.

---

# Authentication

Protected endpoints require a valid JWT.

Include the token in the request header:

```http
Authorization: Bearer <JWT_TOKEN>
```

Example:

```bash
curl http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Admin endpoints require both authentication and administrator authorization.

---

# API Overview

| Module         | Base Route        | Access                 |
| -------------- | ----------------- | ---------------------- |
| Health         | `/api/health`     | Public                 |
| Authentication | `/api/auth`       | Public / Authenticated |
| Categories     | `/api/categories` | Authenticated          |
| Expenses       | `/api/expenses`   | Authenticated          |
| Budgets        | `/api/budgets`    | Authenticated          |
| Dashboard      | `/api/dashboard`  | Authenticated          |
| Admin          | `/api/admin`      | Admin                  |

---

# 1. Health Check

## `GET /api/health`

Checks whether the API server is running.

### Authentication

Not required.

### Example

```bash
curl http://localhost:5000/api/health
```

### Response

```json
{
  "status": "ok"
}
```

---

# 2. Authentication

Base route:

```text
/api/auth
```

## `POST /api/auth/register`

Creates a new user account.

### Authentication

Not required.

### Request

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

---

## `POST /api/auth/login`

Authenticates an existing user.

### Authentication

Not required.

### Request

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response

Returns authentication information including a JWT.

Example:

```json
{
  "token": "<JWT_TOKEN>",
  "user": {
    "id": "USER_ID",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## `GET /api/auth/me`

Returns the currently authenticated user's information.

### Authentication

Required.

### Header

```http
Authorization: Bearer <JWT_TOKEN>
```

---

## `PUT /api/auth/me`

Updates the authenticated user's profile.

### Authentication

Required.

### Request

```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

---

## `PUT /api/auth/change-password`

Changes the authenticated user's password.

### Authentication

Required.

### Request

```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

---

## `POST /api/auth/forgot-password`

Starts the password recovery process.

### Authentication

Not required.

### Request

```json
{
  "email": "john@example.com"
}
```

---

## `PUT /api/auth/reset-password/:token`

Resets a password using a valid reset token.

### Authentication

Not required.

### URL Parameters

| Parameter | Description          |
| --------- | -------------------- |
| `token`   | Password reset token |

### Request

```json
{
  "password": "newPassword123"
}
```

---

# 3. Categories

Base route:

```text
/api/categories
```

All endpoints require authentication.

## `GET /api/categories`

Returns categories available to the authenticated user.

---

## `POST /api/categories`

Creates a new category.

### Request

```json
{
  "name": "Entertainment"
}
```

---

## `PUT /api/categories/:id`

Updates an existing category.

### URL Parameters

| Parameter | Description |
| --------- | ----------- |
| `id`      | Category ID |

### Request

```json
{
  "name": "Subscriptions"
}
```

---

## `DELETE /api/categories/:id`

Deletes a category.

### URL Parameters

| Parameter | Description |
| --------- | ----------- |
| `id`      | Category ID |

---

# 4. Expenses

Base route:

```text
/api/expenses
```

All endpoints require authentication.

## `GET /api/expenses`

Returns expenses belonging to the authenticated user.

### Example

```bash
curl http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## `GET /api/expenses/export`

Exports the authenticated user's expense data.

### Authentication

Required.

---

## `POST /api/expenses`

Creates a new expense.

### Request

```json
{
  "amount": 500,
  "description": "Groceries",
  "categoryId": "CATEGORY_ID",
  "date": "2026-09-09"
}
```

---

## `PUT /api/expenses/:id`

Updates an existing expense.

### URL Parameters

| Parameter | Description |
| --------- | ----------- |
| `id`      | Expense ID  |

### Request

```json
{
  "amount": 750,
  "description": "Updated expense"
}
```

---

## `DELETE /api/expenses/:id`

Deletes an expense.

### URL Parameters

| Parameter | Description |
| --------- | ----------- |
| `id`      | Expense ID  |

---

# 5. Budgets

Base route:

```text
/api/budgets
```

All endpoints require authentication.

## `GET /api/budgets`

Returns budgets belonging to the authenticated user.

---

## `POST /api/budgets`

Creates a new budget.

### Example Request

```json
{
  "categoryId": "CATEGORY_ID",
  "amount": 5000,
  "month": 9,
  "year": 2026
}
```

---

## `PUT /api/budgets/:id`

Updates an existing budget.

### URL Parameters

| Parameter | Description |
| --------- | ----------- |
| `id`      | Budget ID   |

---

## `DELETE /api/budgets/:id`

Deletes an existing budget.

### URL Parameters

| Parameter | Description |
| --------- | ----------- |
| `id`      | Budget ID   |

---

# 6. Dashboard

Base route:

```text
/api/dashboard
```

All endpoints require authentication.

## `GET /api/dashboard/summary`

Returns financial summary information for the authenticated user.

---

## `GET /api/dashboard/trend`

Returns spending trend information for the authenticated user.

---

# 7. Admin

Base route:

```text
/api/admin
```

All admin endpoints require:

* Valid JWT authentication
* `ADMIN` authorization

## `GET /api/admin/users`

Returns registered users.

### Access

`ADMIN`

---

## `GET /api/admin/stats`

Returns application-level statistics.

### Access

`ADMIN`

---

## `PUT /api/admin/users/:id/role`

Updates a user's role.

### Access

`ADMIN`

### URL Parameters

| Parameter | Description |
| --------- | ----------- |
| `id`      | User ID     |

### Request

```json
{
  "role": "ADMIN"
}
```

---

## `GET /api/admin/activity`

Returns application activity information.

### Access

`ADMIN`

---

## `GET /api/admin/categories`

Returns system categories.

### Access

`ADMIN`

---

## `POST /api/admin/categories`

Creates a system category.

### Access

`ADMIN`

### Request

```json
{
  "name": "New Category"
}
```

---

## `PUT /api/admin/categories/:id/toggle`

Enables or disables a system category.

### Access

`ADMIN`

### URL Parameters

| Parameter | Description |
| --------- | ----------- |
| `id`      | Category ID |

---

# HTTP Status Codes

| Status | Meaning                                       |
| -----: | --------------------------------------------- |
|  `200` | Request successful                            |
|  `201` | Resource created                              |
|  `400` | Bad request                                   |
|  `401` | Authentication required / invalid credentials |
|  `403` | Insufficient permissions                      |
|  `404` | Resource not found                            |
|  `429` | Too many requests                             |
|  `500` | Internal server error                         |

---

# Security

The API uses several security mechanisms:

* JWT authentication
* bcrypt password hashing
* Protected routes
* Role-based authorization
* Rate limiting
* CORS configuration
* Environment variables for secrets
* Password-reset tokens

Never expose the following in source control:

```text
.env
JWT secrets
Database credentials
Email service credentials
API keys
```

---

# Example API Workflow

A typical user flow looks like this:

```text
1. Register
      │
      ▼
2. Login
      │
      ▼
3. Receive JWT
      │
      ▼
4. Send JWT with requests
      │
      ├──► Categories
      │
      ├──► Expenses
      │
      ├──► Budgets
      │
      └──► Dashboard
```

An administrator additionally has access to:

```text
Admin Login
     │
     ▼
JWT + ADMIN role
     │
     ▼
Admin API
 ├── Users
 ├── Statistics
 ├── Activity
 └── Categories
```

---

# Endpoint Reference

| Method | Endpoint                           | Access | Purpose                |
| ------ | ---------------------------------- | ------ | ---------------------- |
| GET    | `/api/health`                      | Public | Health check           |
| POST   | `/api/auth/register`               | Public | Register               |
| POST   | `/api/auth/login`                  | Public | Login                  |
| GET    | `/api/auth/me`                     | User   | Get profile            |
| PUT    | `/api/auth/me`                     | User   | Update profile         |
| PUT    | `/api/auth/change-password`        | User   | Change password        |
| POST   | `/api/auth/forgot-password`        | Public | Request password reset |
| PUT    | `/api/auth/reset-password/:token`  | Public | Reset password         |
| GET    | `/api/categories`                  | User   | List categories        |
| POST   | `/api/categories`                  | User   | Create category        |
| PUT    | `/api/categories/:id`              | User   | Update category        |
| DELETE | `/api/categories/:id`              | User   | Delete category        |
| GET    | `/api/expenses`                    | User   | List expenses          |
| GET    | `/api/expenses/export`             | User   | Export expenses        |
| POST   | `/api/expenses`                    | User   | Create expense         |
| PUT    | `/api/expenses/:id`                | User   | Update expense         |
| DELETE | `/api/expenses/:id`                | User   | Delete expense         |
| GET    | `/api/budgets`                     | User   | List budgets           |
| POST   | `/api/budgets`                     | User   | Create budget          |
| PUT    | `/api/budgets/:id`                 | User   | Update budget          |
| DELETE | `/api/budgets/:id`                 | User   | Delete budget          |
| GET    | `/api/dashboard/summary`           | User   | Financial summary      |
| GET    | `/api/dashboard/trend`             | User   | Spending trends        |
| GET    | `/api/admin/users`                 | Admin  | List users             |
| GET    | `/api/admin/stats`                 | Admin  | Application statistics |
| PUT    | `/api/admin/users/:id/role`        | Admin  | Update user role       |
| GET    | `/api/admin/activity`              | Admin  | Activity information   |
| GET    | `/api/admin/categories`            | Admin  | List system categories |
| POST   | `/api/admin/categories`            | Admin  | Create system category |
| PUT    | `/api/admin/categories/:id/toggle` | Admin  | Toggle category        |

---

# Related Documentation

* [Project README](./README.md)
* [GitHub Repository](https://github.com/anamikakt-bot/expense-tracker)
* [Live Application](https://expense-tracker-anamik.vercel.app/)
