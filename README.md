# Order Management System

A full-stack Order Management System for managing products, customers, and orders with inventory tracking.

**Built by Aditya Nayan**

---

## Tech Stack

| Layer       | Technology                        |
| ----------- | --------------------------------- |
| Backend     | Python, FastAPI                   |
| Frontend    | React 18, Vite, Tailwind CSS     |
| Database    | PostgreSQL (prod) / SQLite (dev)  |
| ORM         | SQLAlchemy 2.0 + Alembic          |
| Container   | Docker + Docker Compose           |
| HTTP Client | Axios                             |
| Notifications | react-hot-toast                 |
| Routing     | react-router-dom v6               |
| Font        | Poppins (Google Fonts)            |

---

## Libraries & Tools

### Backend
- **FastAPI** — async Python web framework
- **Uvicorn** — ASGI server
- **SQLAlchemy** — ORM for database operations
- **Alembic** — database migrations
- **Pydantic v2** — request/response validation
- **psycopg2-binary** — PostgreSQL driver
- **python-dotenv** — environment variable management

### Frontend
- **React 18** — component-based UI
- **Vite** — fast dev server and bundler
- **Tailwind CSS** — utility-first CSS framework
- **Axios** — HTTP client for API calls
- **react-router-dom** — client-side routing
- **react-hot-toast** — toast notifications

---

## Folder Structure

```
OMS/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app + dashboard endpoint
│   │   ├── database.py          # SQLAlchemy engine + seed data
│   │   ├── models.py            # Product, Customer, Order, OrderItem
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   └── routers/
│   │       ├── __init__.py
│   │       ├── products.py      # CRUD for products
│   │       ├── customers.py     # CRUD for customers
│   │       └── orders.py        # Orders + transactional stock
│   ├── alembic/
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │       └── 001_initial.py   # Initial migration
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Customers.jsx
│   │   │   └── Orders.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── Dockerfile
│   ├── .dockerignore
│   └── .env.example
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Setup & Run

### Option 1: Docker Compose (recommended)

```bash
cp .env.example .env
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger Docs: http://localhost:8000/docs

### Option 2: Run Locally (without Docker)

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env — set DATABASE_URL=sqlite:///./oms.db for local dev
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

## API Endpoints

| Method | Endpoint                  | Description                           |
| ------ | ------------------------- | ------------------------------------- |
| GET    | `/products`               | List all products                     |
| POST   | `/products`               | Create product (unique SKU enforced)  |
| DELETE | `/products/{id}`          | Delete a product                      |
| GET    | `/customers`              | List all customers                    |
| POST   | `/customers`              | Create customer (unique email enforced) |
| DELETE | `/customers/{id}`         | Delete a customer                     |
| GET    | `/orders`                 | List all orders with items            |
| POST   | `/orders`                 | Create order (validates stock)        |
| PATCH  | `/orders/{id}/status`     | Update order status                   |
| GET    | `/dashboard`              | Dashboard stats + low stock alerts    |

---

## Business Rules

- **Unique SKU** — Duplicate product SKUs are rejected (HTTP 400)
- **Unique Email** — Duplicate customer emails are rejected (HTTP 400)
- **Stock Validation** — Orders fail if any product has insufficient stock
- **Automatic Stock Deduction** — Stock is decremented atomically on order creation
- **Price Snapshot** — Unit price is captured from product price at order time
- **Seed Data** — 3 products and 2 customers are auto-seeded on first startup

---

## Environment Variables

| Variable         | Description                    | Default                                    |
| ---------------- | ------------------------------ | ------------------------------------------ |
| `DATABASE_URL`   | Database connection string     | `sqlite:///./oms.db` (local) / PostgreSQL  |
| `ALLOWED_ORIGINS`| CORS allowed origins           | `http://localhost:5173`                    |
| `VITE_API_URL`   | Backend API URL (frontend)     | `http://localhost:8000`                    |
