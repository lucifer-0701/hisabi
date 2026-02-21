# Hisabi - Simple Billing & Smart Inventory

**Hisabi** is a production-ready MVP SaaS tailored for small retail shops in UAE and Kuwait.

## Features
- **Shop & User Management**: Admin and Staff roles.
- **Inventory Management**: Track stock, cost/selling price, barcodes.
- **Point of Sale (POS)**: Fast billing, VAT handling (5% UAE / 0% Kuwait).
- **Invoices**: Professional PDF generation (Tax Invoice compliant).
- **Reports**: Daily sales tracking and revenue insights.

## Project Structure
- `backend/`: Node.js, Express, PostgreSQL (Sequelize).
- `frontend/`: React, Vite, Tailwind CSS.

## Getting Started

### 1. Prerequisites
- Node.js (v16+)
- PostgreSQL Database

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env file with DATABASE_URL
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Database Schema
Run the SQL script in `database/schema.sql` to initialize your database manually, or let Sequelize sync automatically on startup (enabled for MVP).

## Deployment
Check `walkthrough.md` for detailed deployment instructions on Render/Railway and Vercel.

---
*Built with ❤️ for Hisabi*
