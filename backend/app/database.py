import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./oms.db",
)

# SQLite needs special handling
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

# Enable WAL mode and foreign keys for SQLite
if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_data():
    """Seed the database with initial products and customers if tables are empty."""
    from app.models import Customer, Product

    db = SessionLocal()
    try:
        product_count = db.query(Product).count()
        customer_count = db.query(Customer).count()

        if product_count == 0:
            products = [
                Product(
                    name="Laptop",
                    sku="LAP-001",
                    description="High-performance laptop",
                    price=999.99,
                    stock=15,
                ),
                Product(
                    name="Mouse",
                    sku="MOU-001",
                    description="Wireless optical mouse",
                    price=29.99,
                    stock=8,
                ),
                Product(
                    name="Keyboard",
                    sku="KEY-001",
                    description="Mechanical keyboard",
                    price=79.99,
                    stock=3,
                ),
            ]
            db.add_all(products)

        if customer_count == 0:
            customers = [
                Customer(
                    name="Aditya",
                    email="aditya@example.com",
                    phone="+91-9876543210",
                    address="Mumbai, India",
                ),
                Customer(
                    name="Aryan",
                    email="aryan@example.com",
                    phone="+91-9876543211",
                    address="Delhi, India",
                ),
            ]
            db.add_all(customers)

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
