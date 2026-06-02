# Order Management System (OMS)

A full-stack **Inventory & Order Management System** for managing products, customers, and orders with real-time inventory tracking.

**Built by Aditya Nayan**

---

## Project Summary

| Item                | Details                                           |
| ------------------- | ------------------------------------------------- |
| Total Pages         | **4 pages** (Dashboard, Products, Customers, Orders) |
| Total API Endpoints | **10 endpoints** (CRUD + Dashboard)               |
| Database Tables     | **4 tables** (products, customers, orders, order_items) |
| Architecture        | REST API (Backend) + SPA (Frontend)               |
| Auth                | None (simplified for assessment)                  |

---

## Pages & Their Functions

| Page | Route | What It Does |
| ---- | ----- | ------------ |
| **Dashboard** | `/` | Displays 4 stat cards (Total Products, Total Customers, Total Orders, Total Revenue). Shows a **Low Stock Alerts** table listing products with stock below 10 units. |
| **Products** | `/products` | Full product table with Name, SKU, Price, Stock columns. **Add Product** button opens a form modal with validation. Stock badges show color-coded status (green = 10+, amber = low, red = out of stock). Delete button with confirmation. |
| **Customers** | `/customers` | Customer table with Name, Email, Phone, Address columns. **Add Customer** button opens a form modal with email format validation. Delete button with confirmation. |
| **Orders** | `/orders` | Order table with Order ID, Customer, Status, Total, Date, Items columns. **New Order** button opens a form with customer dropdown, dynamic product item rows, quantity inputs, and a **live running total**. Inline status dropdown to update order status (Pending → Processing → Shipped → Delivered). |

---

## Business Rules Implemented

| Rule | Implementation |
| ---- | -------------- |
| **Unique Product SKUs** | `POST /products` rejects duplicate SKUs with HTTP 400 error |
| **Unique Customer Emails** | `POST /customers` rejects duplicate emails with HTTP 400 error |
| **Inventory Validation** | `POST /orders` checks if all products have sufficient stock before creating the order. Returns `"Insufficient stock for: <product_name>"` if stock is too low |
| **Automatic Stock Reduction** | When an order is created, product stock is decremented atomically in a single database transaction |
| **Price Snapshot** | Unit price is captured from the product's current price at order time, so future price changes don't affect existing orders |
| **Transactional Safety** | Order creation (items + stock deduction + total calculation) happens in a single transaction — if anything fails, everything is rolled back |
| **Seed Data** | 3 products and 2 customers are auto-seeded on first startup if tables are empty |

---

## Tech Stack

| Layer         | Technology                              |
| ------------- | --------------------------------------- |
| Backend       | Python 3.11, FastAPI                    |
| Frontend      | React 18, Vite                          |
| Styling       | Tailwind CSS                            |
| Database      | PostgreSQL (production) / SQLite (dev)  |
| ORM           | SQLAlchemy 2.0                          |
| Migrations    | Alembic                                 |
| Containerization | Docker + Docker Compose              |

---

## Libraries & Tools Used

### Backend Libraries

| Library            | Version  | Purpose                                |
| ------------------ | -------- | -------------------------------------- |
| FastAPI            | 0.104.1  | Python web framework for REST API      |
| Uvicorn            | 0.24.0   | ASGI server to run FastAPI             |
| SQLAlchemy         | 2.0.23   | ORM for database models & queries      |
| Alembic            | 1.13.0   | Database schema migration tool         |
| Pydantic           | 2.5.2    | Request/response data validation       |
| psycopg2-binary    | 2.9.9    | PostgreSQL database driver             |
| python-dotenv      | 1.0.0    | Load environment variables from .env   |

### Frontend Libraries

| Library            | Version  | Purpose                                |
| ------------------ | -------- | -------------------------------------- |
| React              | 18.x     | Component-based UI framework           |
| Vite               | 5.x      | Fast dev server and build tool         |
| Tailwind CSS       | 3.x      | Utility-first CSS framework            |
| Axios              | 1.x      | HTTP client for API calls              |
| react-router-dom   | 6.x      | Client-side page routing               |
| react-hot-toast    | 2.x      | Toast notification popups              |
| PostCSS            | 8.x      | CSS processing for Tailwind            |
| Autoprefixer       | 10.x     | CSS vendor prefix automation           |

### DevOps Tools

| Tool             | Purpose                                  |
| ---------------- | ---------------------------------------- |
| Docker           | Containerize backend & frontend          |
| Docker Compose   | Orchestrate multi-container setup        |
| Git + GitHub     | Version control & code hosting           |
| Docker Hub       | Container image registry                 |
| Render.com       | Free backend + PostgreSQL hosting        |
| Vercel           | Free frontend hosting                    |

### Font

| Font     | Weight        | Source       |
| -------- | ------------- | ------------ |
| Poppins  | 400, 500, 600, 700 | Google Fonts |

---

## API Endpoints

### Products

| Method | Endpoint           | Description                          | Status Codes     |
| ------ | ------------------ | ------------------------------------ | ---------------- |
| GET    | `/products`        | Returns all products                 | 200              |
| POST   | `/products`        | Create a product (unique SKU)        | 201, 400         |
| DELETE | `/products/{id}`   | Delete a product by ID               | 200, 404         |

### Customers

| Method | Endpoint            | Description                          | Status Codes     |
| ------ | ------------------- | ------------------------------------ | ---------------- |
| GET    | `/customers`        | Returns all customers                | 200              |
| POST   | `/customers`        | Create a customer (unique email)     | 201, 400         |
| DELETE | `/customers/{id}`   | Delete a customer by ID              | 200, 404         |

### Orders

| Method | Endpoint                  | Description                                          | Status Codes     |
| ------ | ------------------------- | ---------------------------------------------------- | ---------------- |
| GET    | `/orders`                 | Returns all orders with customer name & item details  | 200              |
| POST   | `/orders`                 | Create order (validates stock, deducts inventory)     | 201, 400, 404    |
| PATCH  | `/orders/{id}/status`     | Update order status (pending/processing/shipped/delivered) | 200, 400, 404 |

### Dashboard

| Method | Endpoint      | Description                                         | Status Codes |
| ------ | ------------- | --------------------------------------------------- | ------------ |
| GET    | `/dashboard`  | Returns total products, customers, orders, revenue, and low stock products list | 200 |

---

## Folder Structure

```
OMS/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app, CORS, dashboard, startup seed
│   │   ├── database.py          # SQLAlchemy engine, session, seed data
│   │   ├── models.py            # Product, Customer, Order, OrderItem models
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── products.py      # GET, POST, DELETE products
│   │       ├── customers.py     # GET, POST, DELETE customers
│   │       └── orders.py        # GET, POST orders + PATCH status
│   ├── alembic/                 # Database migration scripts
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │       └── 001_initial.py
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Sidebar navigation
│   │   │   ├── Modal.jsx        # Reusable modal component
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Stats + low stock alerts
│   │   │   ├── Products.jsx     # Product CRUD table
│   │   │   ├── Customers.jsx    # Customer CRUD table
│   │   │   └── Orders.jsx       # Orders + new order form
│   │   ├── api.js               # Axios instance
│   │   ├── App.jsx              # Router setup
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Tailwind + custom styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── Dockerfile
│   └── .env.example
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Setup & Run

### Option 1: Docker Compose

```bash
cp .env.example .env
docker-compose up --build
```

| Service       | URL                          |
| ------------- | ---------------------------- |
| Frontend      | http://localhost:5173         |
| Backend API   | http://localhost:8000         |
| Swagger Docs  | http://localhost:8000/docs    |

### Option 2: Run Locally (without Docker)

**Backend:**
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

---

## Environment Variables

| Variable         | Description                    | Default                                    |
| ---------------- | ------------------------------ | ------------------------------------------ |
| `DATABASE_URL`   | Database connection string     | `sqlite:///./oms.db` (local dev)           |
| `ALLOWED_ORIGINS`| CORS allowed origins           | `http://localhost:5173`                    |
| `VITE_API_URL`   | Backend API URL (frontend)     | `http://localhost:8000`                    |

## After Deployment 
'Docker Image Link' = https://hub.docker.com/r/adityanayan/oms-backend
'Vercel (Frontend Link)' = https://order-managment-system-oms.vercel.app/
'Render (Backend Link)' = https://order-managment-system-oms.onrender.com
'Render (Postgre Database)' = https://order-managment-system-oms.onrender.com/docs
---

## UI Features

- Light theme with clean, professional design
- Poppins font (Google Fonts)
- Responsive sidebar navigation (collapsible on mobile)
- Loading spinners on all API calls
- Toast notifications for success/error feedback
- Empty state messages on all pages
- Form validation with inline error messages
- Color-coded stock badges (green/amber/red)
- Color-coded order status badges
- Live running total in order creation form
