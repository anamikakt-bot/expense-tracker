# Expense Tracker

A full-stack personal expense and budget tracking application with role-based admin management, real-time analytics, and email-based password recovery.

**Live app:** https://expense-tracker-nu-opal-rkflh9karh.vercel.app/
**API base URL:** https://expense-tracker-api-gf5r.onrender.com/api

---

## Features

### Core
- User registration, login, and JWT-based authentication
- Add, edit, delete, and filter transactions (expenses and income)
- Category management (user-owned + admin-managed system categories)
- Monthly budgets with live spend tracking and over-budget warnings, grouped by month
- Dashboard with income/expense/savings summary, 6-month trend chart, and category breakdown chart
- CSV export of transaction history (respects active filters)
- Forgot password flow with real email delivery (via Resend)
- Light/dark theme toggle
- Fully responsive — desktop, tablet, and mobile (with a slide-out drawer nav on mobile)

### Admin
- Role-based access control (`USER` / `ADMIN`), enforced server-side
- Admin dashboard: total users, transactions, budgets, and amount tracked
- User management: view all users, promote/demote roles (with confirmation), see per-user activity counts
- System categories: admin-created categories automatically propagate to all existing users and new registrations; deactivating a category removes it from users who haven't used it yet (preserves it on existing transactions/budgets)
- Audit log: tracks registrations, transaction/budget changes, and role changes with timestamps

### Security
- Passwords hashed with bcrypt, never stored or logged in plain text
- JWTs signed with a secret key, 7-day expiry
- Rate limiting on auth routes (10 login/register attempts per 15 min, 3 password-reset requests per hour)
- All protected routes verify the JWT server-side; role checks (`ADMIN`) are enforced in middleware, never trusted from the client
- Amount/budget fields capped at a sane maximum, validated both client- and server-side

---

## Tech Stack

**Frontend:** React (Vite), React Router, Axios, Recharts
**Backend:** Node.js, Express, Prisma ORM
**Database:** PostgreSQL (Neon, serverless)
**Auth:** JWT + bcrypt
**Email:** Resend (HTTP API — chosen over SMTP because most free hosting tiers, including Render, block outbound SMTP ports)
**Deployment:** Vercel (frontend), Render (backend), Neon (database)

---

## Project Structure

```
expense-tracker/
├── client/                  # React frontend (Vite)
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── components/      # Layout, ThemeIcons, LoadingSpinner
│       ├── context/         # AuthContext, ThemeContext, ToastContext
│       ├── pages/           # Dashboard, Transactions (Expenses), Budgets, Settings, Admin, AuthPage, ForgotPassword, ResetPassword
│       ├── services/        # axios instance (api.js)
│       └── index.css
├── server/                  # Express backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── controllers/     # auth, expense, budget, category, dashboard, admin
│       ├── middleware/      # auth (JWT verify + role check), rateLimiter
│       ├── routes/
│       └── utils/           # mailer (Resend), auditLog
└── README.md
```

---

## Database Schema

- **User** — id, name, email, password (hashed), role (`USER`/`ADMIN`), resetToken/resetTokenExpiry, createdAt
- **Category** — id, name, color, userId (per-user, not shared)
- **SystemCategory** — id, name, active (admin-managed master list, propagated to users on creation)
- **Expense** — id, amount, description, date, type (`EXPENSE`/`INCOME`), userId, categoryId
- **Budget** — id, month, year, limitAmount, userId, categoryId (nullable — null means "overall" budget)
- **AuditLog** — id, userId, userName, action, entityType, entityId, details, createdAt

All relations are foreign-key linked (no denormalized duplication); see `server/prisma/schema.prisma` for the full definition.

---

## Running Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL running locally (or a Neon/other hosted Postgres connection string)
- A Resend account and API key (for password-reset emails — optional for local dev if you skip that feature)

### 1. Clone and install

```bash
git clone https://github.com/anamikakt-bot/expense-tracker.git
cd expense-tracker
```

### 2. Backend setup

```bash
cd server
npm install
```

Create `server/.env`:

```
PORT=5001
DATABASE_URL="postgresql://username@localhost:5432/expense_tracker"
JWT_SECRET=your_random_secret_here
RESEND_API_KEY=your_resend_api_key
CLIENT_URL=http://localhost:5173
```

Generate a secure `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run migrations:
```bash
npx prisma migrate dev
```

Start the backend:
```bash
npm run dev
```
Backend runs on `http://localhost:5001`.

### 3. Frontend setup

```bash
cd ../client
npm install
```

Create `client/.env`:
```
VITE_API_URL=http://localhost:5001/api
```

Start the frontend:
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`.

### 4. Create an admin account

Register normally through the app, then promote yourself via `psql`:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```
Log out and back in to pick up the new role.

---

## Deployment Notes

- **Frontend (Vercel):** root directory set to `client`, env var `VITE_API_URL` points at the deployed backend. A `vercel.json` rewrite rule (`"/(.*)" → "/index.html"`) is required so client-side routes (e.g. `/dashboard`) don't 404 on direct refresh.
- **Backend (Render):** root directory set to `server`, build command `npm install && npx prisma generate`, start command `node src/index.js`. `app.set('trust proxy', 1)` is required in `index.js` — without it, `express-rate-limit` throws a `ValidationError` on Render's proxy layer.
- **Database (Neon):** migrations run once against the direct (non-pooled) connection string via `npx prisma migrate deploy`; the app itself uses the pooled connection string in production for better concurrency handling.
- **Email (Resend):** Render's free tier blocks outbound SMTP ports (25/465/587), so Gmail+Nodemailer does not work there — Resend's HTTP API was used instead for that reason.

## Known Limitations

- Render's free tier spins down after ~15 minutes of inactivity; the first request after that can take 50+ seconds to respond.
- JWTs are stored in `localStorage` rather than an httpOnly cookie — hoping it's a reasonable tradeoff for a project at this scale 😓, though a production app handling sensitive financial data at larger scale would typically use httpOnly cookies to reduce XSS exposure.
- The activity log and user list are not paginated; would need pagination/search before handling hundreds of users🙂‍↕️.
