"""Goods Receiving — Data Access"""

import uuid
from typing import Sequence
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from app.goods_receiving.models import GoodsReceiptModel, GoodsReceiptItemModel

class GoodsReceivingRepository:
    """Repository for Goods Receiving domain data access."""
    
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_all(self) -> Sequence[GoodsReceiptModel]:
        query = select(GoodsReceiptModel).options(
            joinedload(GoodsReceiptModel.purchase_order),
            joinedload(GoodsReceiptModel.supplier),
            joinedload(GoodsReceiptModel.warehouse),
            joinedload(GoodsReceiptModel.items).joinedload(GoodsReceiptItemModel.product)
        ).order_by(GoodsReceiptModel.created_at.desc())
            
        result = await self.session.execute(query)
        return result.unique().scalars().all()

    async def get_by_id(self, receipt_id: uuid.UUID) -> GoodsReceiptModel | None:
        query = select(GoodsReceiptModel).options(
            joinedload(GoodsReceiptModel.purchase_order),
            joinedload(GoodsReceiptModel.supplier),
            joinedload(GoodsReceiptModel.warehouse),
            joinedload(GoodsReceiptModel.items).joinedload(GoodsReceiptItemModel.product)
        ).where(GoodsReceiptModel.id == receipt_id)
        
        result = await self.session.execute(query)
        return result.unique().scalars().first()

    async def create(self, receipt: GoodsReceiptModel) -> GoodsReceiptModel:
        self.session.add(receipt)
        await self.session.flush()
        return await self.get_by_id(receipt.id)
