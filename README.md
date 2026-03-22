# ExpenseIQ 💰 – Smart Expense Tracker

A full-stack Smart Expense Tracker with AI-powered insights, built with **React.js**, **Node.js**, **Express**, and **MongoDB**.

## Features

- 🔐 **Authentication** – Register/Login with JWT
- 📊 **Dashboard** – Income, Expense & Savings overview
- 💳 **Transactions** – Add, Edit, Delete with filters & search
- 📈 **Analytics** – Pie & Bar charts (Recharts)
- 🤖 **AI Insights** – Smart spending analysis & predictions
- 📄 **PDF Reports** – Downloadable financial reports
- 🔔 **Budget Alerts** – Warnings when nearing limit

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React.js, Tailwind CSS, Recharts, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |

## Project Structure

```
ExpenseIQ/
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── context/
│   └── package.json
│
├── backend/           # Express + MongoDB
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### Backend
```bash
cd backend
npm install
# Create .env with: PORT=5000, MONGODB_URI, JWT_SECRET
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/transactions` | List transactions |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/analytics/summary` | Financial summary |
| GET | `/api/analytics/categories` | Category breakdown |
| GET | `/api/analytics/monthly` | Monthly trends |
| POST | `/api/ai-insights/generate` | AI analysis |
| GET | `/api/reports/pdf` | Download PDF report |

## License

MIT
