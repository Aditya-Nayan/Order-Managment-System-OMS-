import os

from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db, seed_data
from app.models import Customer, Order, Product
from app.routers import customers, orders, products
from app.schemas import DashboardResponse

load_dotenv()

app = FastAPI(title="Order Management System")

# CORS configuration
allowed_origins_str = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,https://order-managment-system-oms.vercel.app"
)
allowed_origins = [origin.strip() for origin in allowed_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(products.router, prefix="/products")
app.include_router(customers.router, prefix="/customers")
app.include_router(orders.router, prefix="/orders")


@app.on_event("startup")
def on_startup():
    """Create tables and seed initial data on application startup."""
    Base.metadata.create_all(bind=engine)
    seed_data()


@app.get("/")
def root():
    """Root endpoint."""
    return {"message": "Order Management System API"}


@app.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    """Return dashboard statistics."""
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_revenue = db.query(func.coalesce(func.sum(Order.total_price), 0.0)).scalar()
    low_stock_products = db.query(Product).filter(Product.stock < 10).all()

    return DashboardResponse(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=float(total_revenue),
        low_stock_products=low_stock_products,
    )
