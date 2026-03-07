# Hisabi — Inventory & Billing SaaS 123

**Hisabi** is a full-stack SaaS POS and inventory management system built for small retail shops in the UAE and Kuwait.

🌐 **Live:** *Coming soon — deploying to Vercel*

---

## Features

| Module | Description |
|---|---|
| 🏪 **Shop & Auth** | Multi-shop registration, Admin/Staff roles, JWT authentication |
| 📦 **Inventory** | Products with stock tracking, barcode support, category management |
| 🧾 **Point of Sale** | Fast billing with barcode scanner, VAT (5% UAE / 0% Kuwait), discount codes |
| 🗒️ **Invoices** | PDF invoice generation (tax-compliant), due payment tracking |
| 📥 **Purchases** | Purchase orders, supplier management |
| 🔄 **Returns** | Product return handling |
| 📊 **Reports** | Daily sales, revenue charts, end-of-day summaries |
| 🎯 **Sales Targets** | Set and track daily/monthly targets |
| 💸 **Expenses** | Expense tracking per shop |
| 🌍 **Multilingual** | English and Arabic (RTL) support via i18next |

---

## Tech Stack

**Backend**
- Node.js + Express 5
- PostgreSQL + Sequelize ORM
- JWT Authentication
- PDFKit (PDF generation)
- Multer (file uploads)

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Recharts (analytics)
- i18next (English/Arabic)
- ZXing (barcode scanner)
- React Router v7

**Deployment**
- [Vercel](https://vercel.com) — frontend (React/Vite SPA) + backend (Serverless Node.js)
- [Supabase](https://supabase.com) — managed PostgreSQL database

---

## Project Structure

```
hisabi/
├── backend/
│   ├── src/
│   │   ├── config/        # Database config (Sequelize + SSL)
│   │   ├── controllers/   # Business logic per feature
│   │   ├── middleware/     # Auth, upload, validation
│   │   ├── models/        # Sequelize models
│   │   ├── routes/        # Express API routes
│   │   ├── services/      # PDF generation (PDFKit)
│   │   └── utils/         # JWT, bcrypt helpers
│   └── vercel.json        # Vercel serverless config
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios instance
│   │   ├── components/    # Layout, ProtectedRoute
│   │   ├── context/       # AuthContext
│   │   ├── pages/         # All page components
│   │   └── public/locales # en / ar translation files
│   └── vercel.json        # Vercel SPA routing config
└── package.json           # Root build scripts
```

---

## Local Development

### Prerequisites
- Node.js v20+
- PostgreSQL (local instance or Supabase connection string)

### Setup

```bash
# 1. Install root dependencies
npm install

# 2. Set up backend
cd backend
npm install
cp .env.example .env   # Fill in DATABASE_URL, JWT_SECRET, FRONTEND_URL
cd ..

# 3. Set up frontend
cd frontend
npm install
cp .env.example .env.local   # Fill in VITE_API_URL=http://localhost:5000
cd ..

# 4. Run both dev servers concurrently
npm start
```

Frontend runs at `http://localhost:5173` and backend at `http://localhost:5000`.

---

## Deployment (Vercel + Supabase)

### 1. Set up Supabase Database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database → Connection String → URI**
3. Copy the `DATABASE_URL` — you'll need it for the backend

### 2. Deploy Backend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import the `lucifer-0701/hisabi` GitHub repo
3. Set **Root Directory** to `backend`
4. Add these **Environment Variables**:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Supabase connection string |
| `JWT_SECRET` | A long random secret string |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Your frontend Vercel URL (e.g. `https://hisabi.vercel.app`) |

5. Deploy — note the backend URL (e.g. `https://hisabi-backend.vercel.app`)

### 3. Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**
2. Import the same repo, set **Root Directory** to `frontend`
3. Add this **Environment Variable**:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your backend Vercel URL (from step 2) |

4. Deploy — the app will be live at your Vercel frontend URL

> ✅ No cold-start sleep on Vercel. Supabase free tier includes 500 MB PostgreSQL.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `NODE_ENV` | Set to `production` on Vercel |
| `FRONTEND_URL` | Frontend URL for CORS (e.g. `https://hisabi.vercel.app`) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `https://hisabi-backend.vercel.app`) |

---

*Built with ❤️ for Hisabi*
