from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.shared.dependencies import get_db
from .schemas import CustomerOrderCreate, CustomerOrderResponse, CustomerOrderUpdate
from .service import CustomerOrderService
from .models import OrderStatusEnum

router = APIRouter(prefix="/customer-orders", tags=["Customer Orders"])

def get_customer_order_service(db: AsyncSession = Depends(get_db)) -> CustomerOrderService:
    return CustomerOrderService(db)

@router.post("", response_model=CustomerOrderResponse, status_code=201)
async def create_customer_order(
    data: CustomerOrderCreate,
    service: CustomerOrderService = Depends(get_customer_order_service)
):
    return await service.create_order(data)

@router.get("", response_model=List[CustomerOrderResponse])
async def list_customer_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    service: CustomerOrderService = Depends(get_customer_order_service)
):
    return await service.list_orders(skip=skip, limit=limit)

@router.get("/{order_id}", response_model=CustomerOrderResponse)
async def get_customer_order(
    order_id: UUID,
    service: CustomerOrderService = Depends(get_customer_order_service)
):
    return await service.get_order(order_id)

@router.put("/{order_id}", response_model=CustomerOrderResponse)
async def update_customer_order(
    order_id: UUID,
    data: CustomerOrderUpdate,
    service: CustomerOrderService = Depends(get_customer_order_service)
):
    return await service.update_order(order_id, data)

@router.post("/{order_id}/confirm", response_model=CustomerOrderResponse)
async def confirm_customer_order(
    order_id: UUID,
    service: CustomerOrderService = Depends(get_customer_order_service)
):
    return await service.update_status(order_id, OrderStatusEnum.CONFIRMED)

@router.post("/{order_id}/cancel", response_model=CustomerOrderResponse)
async def cancel_customer_order(
    order_id: UUID,
    service: CustomerOrderService = Depends(get_customer_order_service)
):
    return await service.update_status(order_id, OrderStatusEnum.CANCELLED)

@router.post("/{order_id}/complete", response_model=CustomerOrderResponse)
async def complete_customer_order(
    order_id: UUID,
    service: CustomerOrderService = Depends(get_customer_order_service)
):
    return await service.update_status(order_id, OrderStatusEnum.COMPLETED)
