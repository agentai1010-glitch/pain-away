"""Stock Movement — Business Logic"""

import uuid
import datetime
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.stock_movement.models import StockMovementModel, MovementTypeEnum
from app.stock_movement.repository import StockMovementRepository
from app.stock_movement.schemas import StockMovementCreate
from app.stock_movement.exceptions import InvalidStockMovementException, InsufficientStockException
from app.inventory.models import InventoryModel

class StockMovementService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = StockMovementRepository(db)

    async def list_movements(
        self, 
        warehouse_id: uuid.UUID | None = None, 
        product_id: uuid.UUID | None = None,
        movement_type: MovementTypeEnum | None = None
    ) -> Sequence[StockMovementModel]:
        return await self.repo.list_all(warehouse_id=warehouse_id, product_id=product_id, movement_type=movement_type)

    async def record_movement(self, data: StockMovementCreate) -> StockMovementModel:
        # Get existing inventory or create one if it doesn't exist
        result = await self.db.execute(
            select(InventoryModel)
            .where(InventoryModel.product_id == data.product_id)
            .where(InventoryModel.warehouse_id == data.warehouse_id)
        )
        inventory = result.scalars().first()

        if not inventory:
            inventory = InventoryModel(
                product_id=data.product_id,
                warehouse_id=data.warehouse_id,
                current_quantity=0,
                reserved_quantity=0
            )
            self.db.add(inventory)
            await self.db.flush()

        balance_before = inventory.current_quantity
        
        # Apply logic based on movement type
        if data.movement_type in [MovementTypeEnum.OPENING_STOCK, MovementTypeEnum.GOODS_RECEIVED, MovementTypeEnum.RETURN]:
            if data.quantity_changed <= 0:
                raise InvalidStockMovementException("Quantity must be positive for additions")
            inventory.current_quantity += data.quantity_changed
            
        elif data.movement_type in [MovementTypeEnum.SALE]:
            if data.quantity_changed <= 0:
                raise InvalidStockMovementException("Quantity must be positive for deductions")
            if inventory.current_quantity < data.quantity_changed:
                raise InsufficientStockException()
            inventory.current_quantity -= data.quantity_changed
            
        elif data.movement_type == MovementTypeEnum.RESERVATION:
            if data.quantity_changed <= 0:
                raise InvalidStockMovementException("Quantity must be positive for reservations")
            if inventory.available_quantity < data.quantity_changed:
                raise InsufficientStockException("Insufficient available stock to reserve")
            inventory.reserved_quantity += data.quantity_changed
            # Note: Reservation doesn't change current physical stock, but for audit purposes, 
            # we record the change in available stock or we record the current stock as balance.
            # We'll stick to balance_after = current_quantity for consistency in physical stock auditing.
            
        elif data.movement_type == MovementTypeEnum.RESERVATION_RELEASED:
            if data.quantity_changed <= 0:
                raise InvalidStockMovementException("Quantity must be positive for reservation releases")
            if inventory.reserved_quantity < data.quantity_changed:
                raise InvalidStockMovementException("Cannot release more reserved stock than exists")
            inventory.reserved_quantity -= data.quantity_changed
            
        elif data.movement_type == MovementTypeEnum.ADJUSTMENT:
            # Positive or negative
            if inventory.current_quantity + data.quantity_changed < 0:
                raise InsufficientStockException("Adjustment cannot result in negative stock")
            inventory.current_quantity += data.quantity_changed

        # Generate reference number
        ref_num = f"MV-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:6].upper()}"

        movement = StockMovementModel(
            reference_number=ref_num,
            product_id=data.product_id,
            warehouse_id=data.warehouse_id,
            movement_type=data.movement_type,
            quantity_changed=data.quantity_changed,
            balance_before=balance_before,
            balance_after=inventory.current_quantity,
            reference_source=data.reference_source,
            notes=data.notes,
            created_by=data.created_by
        )

        return await self.repo.create(movement)
