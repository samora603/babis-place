# Babis Place 🛒

A single-vendor campus ecommerce platform for students. Browse products, add to cart, and pay with M-Pesa.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + Phone OTP (Africa's Talking) |
| Payments | M-Pesa Daraja STK Push |
| Images | Cloudinary |

## Project Structure

```
Babis-place/
├── backend/        # Express API server
└── frontend/       # React Vite application
```

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- M-Pesa Daraja API credentials
- Africa's Talking API key (for OTP SMS)
- Cloudinary account

### Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in all environment variables
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for required variables.

## Features

- 🛍️ Product browsing, search & filtering
- 🛒 Shopping cart
- ❤️ Wishlist
- 📦 Order management (pickup or delivery)
- 💳 M-Pesa STK Push payments
- 🔐 Phone OTP authentication
- 🗂️ Admin dashboard
- 📊 Inventory management
- ⭐ Product reviews

## API Base URL

Development: `http://localhost:5000/api`
