from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from .models import CustomerOrderModel, CustomerOrderItemModel

class CustomerOrderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, order_id: UUID) -> Optional[CustomerOrderModel]:
        stmt = select(CustomerOrderModel).where(CustomerOrderModel.id == order_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[CustomerOrderModel]:
        stmt = select(CustomerOrderModel).order_by(CustomerOrderModel.created_at.desc()).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    def create(self, order: CustomerOrderModel) -> CustomerOrderModel:
        self.session.add(order)
        return order

    async def generate_order_number(self) -> str:
        from datetime import datetime
        import secrets
        date_str = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        random_str = secrets.token_hex(3).upper()
        return f"CO-{date_str}-{random_str}"
