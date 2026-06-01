from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Customer, Order, OrderItem, OrderStatus, Product
from app.schemas import OrderCreate, OrderResponse, OrderStatusUpdate

router = APIRouter(tags=["Orders"])


@router.get("/", response_model=list[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    """Return all orders with customer name and items (eager loaded)."""
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .all()
    )

    result = []
    for order in orders:
        result.append(
            OrderResponse(
                id=order.id,
                customer_id=order.customer_id,
                customer_name=order.customer.name,
                status=order.status,
                total_price=order.total_price,
                created_at=order.created_at,
                items=order.items,
            )
        )
    return result


@router.post("/", response_model=OrderResponse, status_code=201)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    """
    Create a new order with transactional stock validation.

    Business rules:
    - Validates that the customer exists
    - Validates that all products exist and have sufficient stock
    - Snapshots unit_price from product.price at order time
    - Decrements product stock atomically
    - Calculates total_price from all order items
    """
    # Validate customer exists
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    if not order_data.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    try:
        # Phase 1: Validate all products and stock availability
        insufficient_stock = []
        product_map = {}

        for item in order_data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product with id {item.product_id} not found",
                )
            if product.stock < item.quantity:
                insufficient_stock.append(product.name)
            product_map[item.product_id] = product

        if insufficient_stock:
            db.rollback()
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for: {', '.join(insufficient_stock)}",
            )

        # Phase 2: Create order and items, decrement stock
        order = Order(
            customer_id=order_data.customer_id,
            status="pending",
            total_price=0.0,
        )
        db.add(order)
        db.flush()

        total_price = 0.0

        for item in order_data.items:
            product = product_map[item.product_id]
            unit_price = product.price

            order_item = OrderItem(
                order_id=order.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=unit_price,
            )
            db.add(order_item)

            product.stock -= item.quantity
            total_price += unit_price * item.quantity

        order.total_price = total_price
        db.commit()
        db.refresh(order)

        # Eager load relationships for the response
        order = (
            db.query(Order)
            .options(
                joinedload(Order.customer),
                joinedload(Order.items).joinedload(OrderItem.product),
            )
            .filter(Order.id == order.id)
            .first()
        )

        return OrderResponse(
            id=order.id,
            customer_id=order.customer_id,
            customer_name=order.customer.name,
            status=order.status,
            total_price=order.total_price,
            created_at=order.created_at,
            items=order.items,
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise


@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
):
    """Update only the status field of an existing order."""
    order = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Validate the status value against the enum
    valid_values = [s.value for s in OrderStatus]
    if status_update.status not in valid_values:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{status_update.status}'. Must be one of: {', '.join(valid_values)}",
        )

    order.status = status_update.status
    db.commit()
    db.refresh(order)

    # Re-fetch with eager loading after refresh
    order = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order_id)
        .first()
    )

    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.name,
        status=order.status,
        total_price=order.total_price,
        created_at=order.created_at,
        items=order.items,
    )
