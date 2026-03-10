# Hisabi-POS — Smart Inventory & Billing SaaS

**Hisabi-POS** is a high-performance, full-stack SaaS Point of Sale and inventory management system designed for modern retail environments. Originally built for the UAE and Kuwait, it now features a specialized expansion for the **Indian market**, including GST compliance and localized payment processing.

🌐 **Live:** *Coming soon — deploying to Netlify/Render*

---

## 🚀 Key Features

| Module | Description |
|---|---|
| 🏪 **Enterprise Auth** | Global unique usernames, Admin/Staff roles, Shop-based segmentation |
| 📦 **Inventory Core** | Real-time stock tracking, Barcode/SKU support, Brand management |
| 🧾 **Modern POS** | High-speed billing terminal with image support, Multi-tax configurations |
| 🇮🇳 **India Expansion** | Specialized 18% GST calculation, HSN/SAC support, INR currency |
| � **Digital Payments** | Integrated **Razorpay** checkout for Indian subscriptions |
| � **Staff Management** | Admin-controlled team access, role-based permissions (Admin/Staff) |
| �️ **Smart Invoices** | Professional PDF generation, tax-compliant headers, thermal printer friendly |
| 🎯 **Sales Ops** | Daily/Monthly revenue targets, Expense tracking, Due payment collection |
| � **Advanced Analytics** | Live dashboard KPIs, Top-selling product trends, Profit margin tracking |
| 🌍 **Global Design** | English & Arabic (RTL) support with a premium, glassmorphism UI |

---

## 🛠️ Tech Stack

**Backend**
- **Node.js + Express 5** (Fast, modern serverless-ready API)
- **PostgreSQL + Sequelize ORM** (Relational data integrity)
- **Razorpay Node SDK** (Secure India payments)
- **PDFKit** (Dynamic tax-compliant invoice generation)
- **Joi** (Strict request validation)

**Frontend**
- **React 18 + Vite** (Ultra-fast HMR and build times)
- **Tailwind CSS** (Custom theme with glassmorphism aesthetics)
- **Lucide-React** (Premium iconography)
- **Recharts** (Visual data storytelling)
- **i18next** (Dynamic multi-language support)

---

## 📂 Project Structure

```
hisabi/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Auth, Business Logic, Payment, Reports
│   │   ├── middleware/    # JWT Security, Role Auth, Validation
│   │   ├── routes/        # API Endpoints (POS, Staff, Products, etc.)
│   │   └── services/      # Razorpay & PDF generation logic
│   └── database/          # Sequelize models & migrations
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI (Modals, Charts, Sidebar)
│   │   ├── pages/         # Dashboard, POS, Staff, Inventory, etc.
│   │   ├── context/       # Auth & Global State Management
│   │   └── public/locales # English and Arabic translation JSONs
└── package.json           # Root automation scripts
```

---

## ⚙️ Local Development

### Prerequisites
- Node.js v20+
- PostgreSQL (Local or Managed like Neon/Supabase)

### Setup

1. **Clone & Install:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   - **Backend:** Create `backend/.env` (use `.env.example` as a template).
   - **Frontend:** Create `frontend/.env.local` with `VITE_API_URL`.

3. **Start Development:**
   ```bash
   npm start
   ```
   *Frontend: `http://localhost:5173` | Backend: `http://localhost:5000`*

---

## 🗺️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret for token signing |
| `RAZORPAY_KEY_ID` | Your Razorpay API Key (for India payments) |
| `RAZORPAY_SECRET` | Your Razorpay API Secret |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of your backend API |

---

*Built with ❤️ for the future of retail by Hisabi-POS Team*
