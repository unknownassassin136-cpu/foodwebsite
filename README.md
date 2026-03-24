# FoodieExpress — Restaurant Food Ordering Platform

A full-stack restaurant ordering system built with **React.js**, **Express.js**, and **MongoDB**.

## Features

- 🍽️ **Menu browsing** with search, category filtering, and item details
- 🛒 **Shopping cart** with quantity controls and persistent storage
- 👤 **User accounts** — registration, login, profile management
- 📦 **Order system** — checkout, order confirmation, order history
- ⚙️ **Admin panel** — dashboard stats, menu CRUD, order management
- 📱 **Responsive** — works on desktop, tablet, and mobile
- 🔐 **JWT authentication** with role-based access control

## Quick Start

### Prerequisites
- **Node.js** 18+ and **npm**
- **MongoDB** running locally (or a MongoDB Atlas URI)

### 1. Clone & Install

```bash
# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
# Copy and edit the server .env file
cp server/.env.example server/.env
# Edit MONGO_URI if using Atlas, and change JWT_SECRET for production
```

### 3. Seed the Database

```bash
cd server
npm run seed
```

This creates sample data with these demo accounts:

| Role  | Email              | Password    |
|-------|--------------------|-------------|
| Admin | admin@foodie.com   | admin123    |
| User  | john@example.com   | password123 |

### 4. Run the Servers

```bash
# Terminal 1 — Backend (port 5000)
cd server
npm start

# Terminal 2 — Frontend (port 5173)
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Endpoints

### Auth
| Method | Endpoint            | Description        | Auth |
|--------|--------------------|--------------------|------|
| POST   | /api/auth/register | Create account     | No   |
| POST   | /api/auth/login    | Login, get JWT     | No   |
| GET    | /api/auth/me       | Current profile    | Yes  |
| PUT    | /api/auth/profile  | Update profile     | Yes  |

### Menu
| Method | Endpoint       | Description              | Auth |
|--------|---------------|--------------------------|------|
| GET    | /api/menu     | List items (filterable)  | No   |
| GET    | /api/menu/:id | Single item              | No   |

### Categories
| Method | Endpoint         | Description      | Auth |
|--------|-----------------|------------------|------|
| GET    | /api/categories | All categories   | No   |

### Orders
| Method | Endpoint         | Description      | Auth |
|--------|-----------------|------------------|------|
| POST   | /api/orders     | Place order      | Yes  |
| GET    | /api/orders     | My orders        | Yes  |
| GET    | /api/orders/:id | Single order     | Yes  |

### Admin
| Method | Endpoint                | Description        | Auth  |
|--------|------------------------|--------------------|-------|
| GET    | /api/admin/stats       | Dashboard stats    | Admin |
| GET    | /api/admin/menu        | All menu items     | Admin |
| POST   | /api/admin/menu        | Create item        | Admin |
| PUT    | /api/admin/menu/:id    | Update item        | Admin |
| DELETE | /api/admin/menu/:id    | Delete item        | Admin |
| POST   | /api/admin/categories  | Create category    | Admin |
| PUT    | /api/admin/categories/:id | Update category | Admin |
| DELETE | /api/admin/categories/:id | Delete category | Admin |
| GET    | /api/admin/orders      | All orders         | Admin |
| PUT    | /api/admin/orders/:id  | Update status      | Admin |

### Query Parameters for GET /api/menu
- `category` — filter by category ID
- `search` — text search on name/description
- `vegetarian=true` — vegetarian only
- `sort` — `price_asc`, `price_desc`, `rating`, `newest`
- `page` & `limit` — pagination

---

## Project Structure

```
foodie-express/
├── server/
│   ├── config/db.js              # MongoDB connection
│   ├── middleware/auth.js        # JWT auth + admin guard
│   ├── middleware/errorHandler.js# Centralized errors
│   ├── models/                   # Mongoose schemas
│   ├── routes/                   # API route handlers
│   ├── seed.js                   # Sample data seeder
│   └── server.js                 # Express entry point
├── client/
│   ├── src/
│   │   ├── api/                  # Axios + service layer
│   │   ├── context/              # Auth & Cart providers
│   │   ├── components/           # Shared UI components
│   │   ├── pages/                # Route-level pages
│   │   ├── App.jsx               # Router setup
│   │   └── index.css             # Design system
│   └── vite.config.js            # Vite + API proxy
└── README.md
```

## Tech Stack

| Layer      | Technology                       |
|-----------|----------------------------------|
| Frontend  | React 19, Vite, React Router 7   |
| Backend   | Express.js 4                     |
| Database  | MongoDB + Mongoose 8             |
| Auth      | JWT (jsonwebtoken + bcryptjs)     |
| Styling   | Vanilla CSS, Inter + Playfair    |
