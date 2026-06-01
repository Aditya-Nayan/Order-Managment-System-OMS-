from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer
from app.schemas import CustomerCreate, CustomerResponse

router = APIRouter(tags=["Customers"])


@router.get("/", response_model=list[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):
    """Return all customers."""
    customers = db.query(Customer).all()
    return customers


@router.post("/", response_model=CustomerResponse, status_code=201)
def create_customer(customer_data: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer. Rejects if email already exists."""
    existing = db.query(Customer).filter(Customer.email == customer_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Customer with email '{customer_data.email}' already exists")

    customer = Customer(**customer_data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=200)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    """Delete a customer by ID."""
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    db.delete(customer)
    db.commit()
    return {"message": "Customer deleted successfully"}
