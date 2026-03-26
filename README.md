# Price Optimization Tool

A full-stack web app to manage products, visualize demand forecasts, and recommend optimized prices.

---

## Tech Stack

- **Frontend** — React.js, Chart.js, Axios
- **Backend** — Node.js, Express.js
- **Database** — PostgreSQL

---

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/khanahammad40-eng/price-optimization-tool.git
cd price-optimization-tool
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=price_optimization
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=Price Optimization Tool <your_email@gmail.com>
FRONTEND_URL=http://localhost:5173
```

### 3. Database setup

Run in pgAdmin or psql:
```sql
CREATE DATABASE price_optimization;
```
Then create the `users`, `products`, and `roles` tables as described in the SQL setup guide.

### 4. Frontend setup
```bash
cd frontend
npm install
```

---

## Run the App

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

- Frontend → http://localhost:5173
- Backend  → http://localhost:5000

---

## Features

- User registration and login with email verification
- Role-based access control (admin, buyer, supplier, custom)
- Product CRUD with search and category filter
- Demand forecast chart using Chart.js
- Pricing optimization table with price comparison

---

## Roles & Permissions

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Supplier | ✅ | ✅ | ✅ | ❌ |
| Buyer | ❌ | ✅ | ❌ | ❌ |
| Custom | ❌ | ✅ | ❌ | ❌ |

---

## Author

Nadendla Ahammad — [GitHub](https://github.com/khanahammad40-eng)
