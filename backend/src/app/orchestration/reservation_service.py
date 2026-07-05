import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.customer_order.service import CustomerOrderService
from app.customer_order.models import OrderStatusEnum, CustomerOrderModel
from app.stock_movement.service import StockMovementService
from app.stock_movement.schemas import StockMovementCreate
from app.stock_movement.models import MovementTypeEnum
from app.stock_movement.exceptions import InsufficientStockException

class InventoryReservationOrchestrator:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.co_service = CustomerOrderService(session)
        self.sm_service = StockMovementService(session)

    async def _get_main_warehouse(self) -> uuid.UUID:
        from app.warehouse.service import WarehouseService
        warehouse_service = WarehouseService(self.session)
        warehouses = await warehouse_service.list_warehouses()
        if not warehouses:
            raise HTTPException(status_code=400, detail="No warehouses configured in the system.")
        return warehouses[0].id

    async def confirm_order(self, order_id: uuid.UUID, user: str = "System") -> CustomerOrderModel:
        order = await self.co_service.get_order(order_id)
        if order.status != OrderStatusEnum.DRAFT:
            raise HTTPException(status_code=400, detail=f"Cannot confirm order in {order.status.value} status.")
            
        warehouse_id = await self._get_main_warehouse()
        
        for item in order.items:
            sm_data = StockMovementCreate(
                product_id=item.product_id,
                warehouse_id=warehouse_id,
                movement_type=MovementTypeEnum.RESERVATION,
                quantity_changed=item.ordered_quantity,
                reference_source="CUSTOMER_ORDER",
                notes=f"Reserved for order {order.order_number}",
                created_by=user
            )
            try:
                await self.sm_service.record_movement(sm_data)
            except InsufficientStockException as e:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Insufficient stock to reserve {item.ordered_quantity} of {item.product_name}. {str(e)}"
                )
            
        return await self.co_service.update_status(order_id, OrderStatusEnum.CONFIRMED)


    async def cancel_order(self, order_id: uuid.UUID, user: str = "System") -> CustomerOrderModel:
        order = await self.co_service.get_order(order_id)
        
        # Draft orders can be cancelled without releasing reservations since none were made
        if order.status == OrderStatusEnum.DRAFT:
            return await self.co_service.update_status(order_id, OrderStatusEnum.CANCELLED)
            
        if order.status != OrderStatusEnum.CONFIRMED:
            raise HTTPException(status_code=400, detail=f"Cannot cancel order in {order.status.value} status.")
            
        warehouse_id = await self._get_main_warehouse()
        
        for item in order.items:
            sm_data = StockMovementCreate(
                product_id=item.product_id,
                warehouse_id=warehouse_id,
                movement_type=MovementTypeEnum.RESERVATION_RELEASED,
                quantity_changed=item.ordered_quantity,
                reference_source="CUSTOMER_ORDER",
                notes=f"Released reservation for cancelled order {order.order_number}",
                created_by=user
            )
            await self.sm_service.record_movement(sm_data)
            
        return await self.co_service.update_status(order_id, OrderStatusEnum.CANCELLED)
