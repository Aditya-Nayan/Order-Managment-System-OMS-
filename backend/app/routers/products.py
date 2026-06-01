from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product
from app.schemas import ProductCreate, ProductResponse

router = APIRouter(tags=["Products"])


@router.get("/", response_model=list[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    """Return all products."""
    products = db.query(Product).all()
    return products


@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(product_data: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product. Rejects if SKU already exists."""
    existing = db.query(Product).filter(Product.sku == product_data.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Product with SKU '{product_data.sku}' already exists")

    product = Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}", status_code=200)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product by ID."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}
