"""Purchase Order — Data Access"""

import uuid
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.purchase_order.models import PurchaseOrderModel, PurchaseOrderItemModel

class PurchaseOrderRepository:
    """Repository for Purchase Order domain data access."""
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_all(self) -> Sequence[PurchaseOrderModel]:
        query = select(PurchaseOrderModel).options(
            joinedload(PurchaseOrderModel.supplier),
            joinedload(PurchaseOrderModel.warehouse),
            joinedload(PurchaseOrderModel.items).joinedload(PurchaseOrderItemModel.product)
        ).order_by(PurchaseOrderModel.created_at.desc())
            
        result = await self.session.execute(query)
        return result.unique().scalars().all()

    async def get_by_id(self, po_id: uuid.UUID) -> PurchaseOrderModel | None:
        query = select(PurchaseOrderModel).options(
            joinedload(PurchaseOrderModel.supplier),
            joinedload(PurchaseOrderModel.warehouse),
            joinedload(PurchaseOrderModel.items).joinedload(PurchaseOrderItemModel.product)
        ).where(PurchaseOrderModel.id == po_id)
        
        result = await self.session.execute(query)
        return result.unique().scalars().first()

    async def create(self, po: PurchaseOrderModel) -> PurchaseOrderModel:
        self.session.add(po)
        await self.session.flush()
        return await self.get_by_id(po.id)

    async def update(self, po: PurchaseOrderModel) -> PurchaseOrderModel:
        # Note: SQLAlchemy tracks changes. Just flushing is enough.
        await self.session.flush()
        return await self.get_by_id(po.id)
