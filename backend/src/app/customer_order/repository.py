from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from uuid import UUID
from .models import CustomerOrderModel, CustomerOrderItemModel

class CustomerOrderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, order_id: UUID) -> Optional[CustomerOrderModel]:
        stmt = select(CustomerOrderModel).options(
            joinedload(CustomerOrderModel.items)
        ).where(CustomerOrderModel.id == order_id)
        result = await self.session.execute(stmt)
        return result.unique().scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[CustomerOrderModel]:
        stmt = select(CustomerOrderModel).options(
            joinedload(CustomerOrderModel.items)
        ).order_by(CustomerOrderModel.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.unique().scalars().all())

    async def create(self, order: CustomerOrderModel) -> CustomerOrderModel:
        self.session.add(order)
        await self.session.flush()
        res = await self.get_by_id(order.id)
        return res or order

    async def update(self, order: CustomerOrderModel) -> CustomerOrderModel:
        await self.session.flush()
        res = await self.get_by_id(order.id)
        return res or order

    async def generate_order_number(self) -> str:
        from datetime import datetime
        import secrets
        date_str = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        random_str = secrets.token_hex(3).upper()
        return f"CO-{date_str}-{random_str}"
