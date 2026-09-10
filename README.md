# Expense Tracker

A full-stack personal finance management application that helps users track expenses, manage monthly budgets, and understand their spending through a centralized dashboard.

 **Live Demo:** [Expense Tracker](https://expense-tracker-anamik.vercel.app/)

## Features

### Authentication

* User registration and login
* Secure password hashing
* JWT-based authentication
* Forgot password and password reset functionality
* Protected application routes

### Expense Management

* Add and manage personal expenses
* Organize expenses for easier tracking
* View spending information from the dashboard

### Dashboard & Analytics

* Overview of financial activity
* Visual representation of spending data
* Charts and summaries to help identify spending patterns

### Budget Management

* Create monthly budgets
* Monitor spending against budgets
* Track financial limits and progress

### Account Settings

* Manage user account settings
* Update account information
* Password management

### Admin Features

* Dedicated admin interface
* Administrative access separate from regular user functionality

## Tech Stack

### Frontend

* **React**
* **Vite**
* **React Router**
* **Axios**
* **Recharts**
* CSS

### Backend

* **Node.js**
* **Express**
* **Prisma ORM**
* **JWT**
* **bcryptjs**
* **Nodemailer / Resend**
* **Express Rate Limit**
* **JSON2CSV**

### Database

* Prisma-supported relational database

## Project Structure

```text
expense-tracker/
│
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── pages/
│       │   ├── Admin.jsx
│       │   ├── AuthPage.jsx
│       │   ├── Budgets.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Expenses.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── ResetPassword.jsx
│       │   └── Settings.jsx
│       └── services/
│
├── server/                 # Express backend
│   ├── prisma/             # Database schema and Prisma configuration
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       ├── utils/
│       └── index.js
│
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/)
* npm
* A database supported by your Prisma configuration

### 1. Clone the repository

```bash
git clone https://github.com/anamikakt-bot/expense-tracker.git
cd expense-tracker
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file based on `.env.example` and configure the required environment variables.

Then run the Prisma setup:

```bash
npx prisma generate
```

If your database requires migrations:

```bash
npx prisma migrate dev
```

Start the backend:

```bash
npm run dev
```

The backend will start using the development server configuration.

### 3. Set up the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The Vite development server will provide the local URL for the frontend.

## Environment Variables

The backend uses environment variables for configuration and sensitive credentials.

Create:

```text
server/.env
```

Use the provided `.env.example` as a reference.

Typical configuration includes:

```env
DATABASE_URL=

JWT_SECRET=

CLIENT_URL=

# Email configuration
...
```

**Do not commit your `.env` file or any API keys, database credentials, or secrets to GitHub.**

## Available Scripts

### Client

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates a production build.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs ESLint.

### Server

```bash
npm run dev
```

Starts the backend using Nodemon.

```bash
npm start
```

Starts the backend in production mode.

## Deployment

The frontend is deployed using Vercel.

**Live application:**
https://expense-tracker-anamik.vercel.app/

The project is structured as separate frontend and backend applications, allowing each part to be developed and deployed independently.

## Security

The application includes several security-oriented features, including:

* Password hashing with bcrypt
* JWT authentication
* Protected routes
* Environment-based secret configuration
* Express rate limiting
* CORS configuration

Sensitive configuration should always be stored in environment variables rather than committed to the repository.

## Future Improvements

Potential improvements include:

* Recurring expenses
* More detailed financial reports
* Exportable reports and analytics
* Additional visualization options
* Improved mobile responsiveness
* Advanced budget notifications
* More granular admin controls

## Project Goal

The goal of this project is to provide a practical full-stack application for managing personal finances while demonstrating concepts including:

* Frontend application architecture
* REST API development
* Authentication and authorization
* Database management with Prisma
* API integration
* Data visualization
* Secure handling of user data
* Full-stack deployment

## Author

**Anamika**

GitHub: [@anamikakt-bot](https://github.com/anamikakt-bot)

---
Hope you find it useful!!
