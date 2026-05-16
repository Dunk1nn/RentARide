# 🚗 Rent A Ride — Car Rental Management System

A full-stack car rental web application with separate Customer and Admin dashboards.

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | HTML5, CSS3, Vanilla JavaScript   |
| Backend   | Node.js + Express.js (REST API)   |
| Database  | MySQL (via XAMPP / phpMyAdmin)    |
| Auth      | JWT (JSON Web Tokens) + bcryptjs  |

---

## 📁 Project Structure

```
rent-a-ride/
├── frontend/
│   ├── css/
│   │   └── style.css               ← All styles
│   ├── js/
│   │   ├── api.js                  ← API fetch helpers
│   │   ├── utils.js                ← Toast, formatters, auth guards
│   │   └── sidebar.js              ← Sidebar renderer
│   └── pages/
│       ├── login.html              ← Customer login
│       ├── register.html           ← Customer registration
│       ├── admin-login.html        ← Admin login
│       ├── customer-dashboard.html ← Customer home
│       ├── browse-cars.html        ← Browse & book cars
│       ├── my-rentals.html         ← Customer rentals list
│       ├── payments.html           ← Customer payments
│       ├── history.html            ← Rental history
│       ├── profile.html            ← Profile settings
│       ├── support.html            ← Submit support ticket
│       ├── admin-dashboard.html    ← Admin home + analytics
│       ├── admin-cars.html         ← Manage cars (CRUD)
│       ├── admin-rentals.html      ← Approve/reject bookings
│       ├── admin-customers.html    ← Manage customers
│       ├── admin-payments.html     ← View all payments
│       ├── admin-admins.html       ← Manage admin accounts
│       └── admin-support.html      ← Reply to support tickets
├── backend/
│   ├── config/
│   │   └── db.js                   ← MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── carsController.js
│   │   ├── rentalsController.js
│   │   ├── paymentsController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js                 ← JWT verification middleware
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── carsRoutes.js
│   │   ├── rentalsRoutes.js
│   │   ├── paymentsRoutes.js
│   │   └── adminRoutes.js
│   ├── server.js                   ← Express entry point
│   ├── .env.example                ← Environment variables template
│   └── package.json
└── database/
    └── schema.sql                  ← MySQL schema + seed data
```

---

## 🚀 Setup Instructions

### Step 1 — Start XAMPP
1. Open XAMPP Control Panel
2. Start **Apache** and **MySQL**

### Step 2 — Create the Database
1. Go to `http://localhost/phpmyadmin`
2. Click **Import**
3. Select `database/schema.sql`
4. Click **Go**

### Step 3 — Setup Backend
```bash
cd backend
cp .env.example .env       # Edit .env if needed (default XAMPP works)
npm install
npm run dev                # or: node server.js
```
Server runs at: `http://localhost:5000`

### Step 4 — Open Frontend
Open any HTML file in `frontend/pages/` directly in your browser.

For example:
- `frontend/pages/login.html` → Customer login
- `frontend/pages/admin-login.html` → Admin login

> **Tip:** Use VS Code Live Server extension for best experience.

---

## 🔐 Default Admin Credentials

| Field    | Value                  |
|----------|------------------------|
| Email    | admin@rentaride.com    |
| Password | password               |

> ⚠️ Change this password in production!

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| POST   | /api/auth/register    | Customer register  |
| POST   | /api/auth/login       | Customer login     |
| POST   | /api/auth/admin/login | Admin login        |
| GET    | /api/auth/profile     | Get current user   |

### Cars
| Method | Endpoint       | Auth        |
|--------|----------------|-------------|
| GET    | /api/cars      | Public      |
| GET    | /api/cars/:id  | Public      |
| POST   | /api/cars      | Admin only  |
| PUT    | /api/cars/:id  | Admin only  |
| DELETE | /api/cars/:id  | Admin only  |

### Rentals
| Method | Endpoint                    | Auth        |
|--------|-----------------------------|-------------|
| POST   | /api/rentals                | Customer    |
| GET    | /api/rentals/my             | Customer    |
| GET    | /api/rentals                | Admin       |
| PUT    | /api/rentals/:id/status     | Admin       |
| PUT    | /api/rentals/:id/cancel     | Customer    |

### Payments
| Method | Endpoint          | Auth        |
|--------|-------------------|-------------|
| POST   | /api/payments     | Customer    |
| GET    | /api/payments/my  | Customer    |
| GET    | /api/payments     | Admin       |

### Admin
| Method | Endpoint                     | Auth  |
|--------|------------------------------|-------|
| GET    | /api/admin/dashboard         | Admin |
| GET    | /api/admin/users             | Admin |
| PUT    | /api/admin/users/:id/status  | Admin |
| DELETE | /api/admin/users/:id         | Admin |
| GET    | /api/admin/admins            | Admin |
| POST   | /api/admin/admins            | Admin |
| GET    | /api/admin/tickets           | Admin |
| PUT    | /api/admin/tickets/:id/reply | Admin |

---

## 🔒 Security Features
- Passwords hashed with **bcryptjs** (10 salt rounds)
- JWT authentication with 7-day expiry
- Admin-only routes protected by middleware
- Input validation on all forms
- CORS configured for frontend origin

---

## 📱 Responsive Design
- Fully responsive for mobile and desktop
- Hamburger sidebar toggle on mobile
- Fluid grid layouts

---

## 🎨 Theme
- **Primary color:** `#1E6FF1` (Blue)
- **Font:** Outfit (Google Fonts)
- **Style:** Clean, minimal, professional
