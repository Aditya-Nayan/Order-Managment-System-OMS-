from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ---------- Product ----------
class ProductCreate(BaseModel):
    name: str
    sku: str
    description: Optional[str] = None
    price: float
    stock: int = 0


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    description: Optional[str] = None
    price: float
    stock: int
    created_at: datetime


# ---------- Customer ----------
class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime


# ---------- Order ----------
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate]


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    product_id: int
    quantity: int
    unit_price: float
    product: ProductResponse


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    customer_name: str
    status: str
    total_price: float
    created_at: datetime
    items: list[OrderItemResponse]


class OrderStatusUpdate(BaseModel):
    status: str


# ---------- Dashboard ----------
class DashboardResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: float
    low_stock_products: list[ProductResponse] = []
