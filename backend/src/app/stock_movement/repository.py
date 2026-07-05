"""Stock Movement — Data Access"""

import uuid
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.stock_movement.models import StockMovementModel, MovementTypeEnum

class StockMovementRepository:
    """Repository for Stock Movement domain data access."""
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_all(
        self, 
        warehouse_id: uuid.UUID | None = None, 
        product_id: uuid.UUID | None = None,
        movement_type: MovementTypeEnum | None = None
    ) -> Sequence[StockMovementModel]:
        query = select(StockMovementModel).options(
            joinedload(StockMovementModel.product), 
            joinedload(StockMovementModel.warehouse)
        ).order_by(StockMovementModel.created_at.desc())
        
        if warehouse_id:
            query = query.where(StockMovementModel.warehouse_id == warehouse_id)
        if product_id:
            query = query.where(StockMovementModel.product_id == product_id)
        if movement_type:
            query = query.where(StockMovementModel.movement_type == movement_type)
            
        result = await self.session.execute(query)
        return result.scalars().all()

    async def create(self, movement: StockMovementModel) -> StockMovementModel:
        self.session.add(movement)
        await self.session.flush()
        # Need to lazy load relationships for response
        result = await self.session.execute(
            select(StockMovementModel)
            .options(joinedload(StockMovementModel.product), joinedload(StockMovementModel.warehouse))
            .where(StockMovementModel.id == movement.id)
        )
        return result.scalars().first()
