# Hisabi — Inventory & Billing SaaS

**Hisabi** is a full-stack SaaS POS and inventory management system built for small retail shops in the UAE and Kuwait.

🌐 **Live:** [https://hisabi-qhtk.onrender.com](https://hisabi-qhtk.onrender.com)

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
- Puppeteer (PDF generation)
- Multer (file uploads)

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Recharts (analytics)
- i18next (English/Arabic)
- ZXing (barcode scanner)
- React Router v7

**Deployment**
- [Render.com](https://render.com) — full-stack monorepo (free tier)
- PostgreSQL managed by Render

---

## Project Structure

```
hisabi/
├── backend/
│   └── src/
│       ├── config/        # Database config (Sequelize + SSL)
│       ├── controllers/   # Business logic per feature
│       ├── middleware/     # Auth, upload, validation
│       ├── models/        # Sequelize models
│       ├── routes/        # Express API routes
│       ├── services/      # PDF generation (Puppeteer)
│       └── utils/         # JWT, bcrypt helpers
├── frontend/
│   └── src/
│       ├── api/           # Axios instance
│       ├── components/    # Layout, ProtectedRoute
│       ├── context/       # AuthContext
│       ├── pages/         # All page components
│       └── public/locales # en / ar translation files
├── render.yaml            # Render deployment config
└── package.json           # Root build scripts
```

---

## Local Development

### Prerequisites
- Node.js v20+
- PostgreSQL (local instance)

### Setup

```bash
# 1. Install root dependencies
npm install

# 2. Set up backend
cd backend
npm install
cp .env.example .env   # Fill in DATABASE_URL, JWT_SECRET, NODE_ENV=development
cd ..

# 3. Set up frontend
cd frontend
npm install
cd ..

# 4. Run both dev servers concurrently
npm start
```

Frontend runs at `http://localhost:5173` and backend at `http://localhost:5000`.

---

## Deployment (Render.com)

The project includes `render.yaml` for one-click Blueprint deployment:

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect the `lucifer-0701/hisabi` GitHub repo
3. Render will auto-create:
   - A **Node.js web service** (build + serve frontend, run backend)
   - A **free PostgreSQL database** (linked via `DATABASE_URL`)
4. Set `JWT_SECRET` in the environment (or let Render auto-generate it)
5. Deploy — the app will be live at `https://<name>.onrender.com`

> ⚠️ Free tier sleeps after inactivity. First request may take ~50 seconds.

---

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (auto-set on Render) |
| `JWT_SECRET` | Secret key for JWT signing |
| `NODE_ENV` | Set to `production` on Render |

---

*Built with ❤️ for Hisabi*
