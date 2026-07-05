from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.product.models import ProductModel
from sqlalchemy import select

from .models import CustomerOrderModel, CustomerOrderItemModel, OrderStatusEnum
from .schemas import CustomerOrderCreate, CustomerOrderUpdate
from .repository import CustomerOrderRepository
from .exceptions import CustomerOrderNotFoundException, InvalidOrderStatusException, ProductNotFoundException, OrderImmutabilityException

class CustomerOrderService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repository = CustomerOrderRepository(session)

    async def get_order(self, order_id: UUID) -> CustomerOrderModel:
        order = await self.repository.get_by_id(order_id)
        if not order:
            raise CustomerOrderNotFoundException()
        return order

    async def list_orders(self, skip: int = 0, limit: int = 100) -> List[CustomerOrderModel]:
        return await self.repository.get_all(skip=skip, limit=limit)

    async def _get_product(self, product_id: UUID) -> ProductModel:
        stmt = select(ProductModel).where(ProductModel.id == product_id)
        result = await self.session.execute(stmt)
        product = result.scalars().first()
        if not product:
            raise ProductNotFoundException(str(product_id))
        return product

    async def create_order(self, data: CustomerOrderCreate) -> CustomerOrderModel:
        order_number = await self.repository.generate_order_number()
        
        order = CustomerOrderModel(
            order_number=order_number,
            customer_name=data.customer_name,
            customer_phone=data.customer_phone,
            order_date=data.order_date,
            status=OrderStatusEnum.DRAFT,
            notes=data.notes,
            created_by=data.created_by,
            subtotal=0.0,
            tax_total=0.0,
            grand_total=0.0,
            items=[]
        )
        
        subtotal = 0.0
        tax_total = 0.0
        
        for item_data in data.items:
            product = await self._get_product(item_data.product_id)
            
            line_total = float(product.selling_price) * item_data.ordered_quantity
            item_tax = line_total * (float(product.tax_rate) / 100.0)
            
            order_item = CustomerOrderItemModel(
                product_id=product.id,
                product_name=product.name,
                sku=product.sku,
                selling_price=product.selling_price,
                tax_rate=product.tax_rate,
                ordered_quantity=item_data.ordered_quantity,
                line_total=line_total
            )
            order.items.append(order_item)
            
            subtotal += line_total
            tax_total += item_tax
            
        order.subtotal = subtotal
        order.tax_total = tax_total
        order.grand_total = subtotal + tax_total
        
        return await self.repository.create(order)

    async def update_order(self, order_id: UUID, data: CustomerOrderUpdate) -> CustomerOrderModel:
        order = await self.get_order(order_id)
        
        if order.status != OrderStatusEnum.DRAFT:
            raise OrderImmutabilityException()
            
        if data.customer_name is not None:
            order.customer_name = data.customer_name
        if data.customer_phone is not None:
            order.customer_phone = data.customer_phone
        if data.order_date is not None:
            order.order_date = data.order_date
        if data.notes is not None:
            order.notes = data.notes
            
        if data.items is not None:
            # Rebuild items completely to keep it simple for DRAFT
            order.items.clear()
            
            subtotal = 0.0
            tax_total = 0.0
            
            for item_data in data.items:
                product = await self._get_product(item_data.product_id)
                
                line_total = float(product.selling_price) * item_data.ordered_quantity
                item_tax = line_total * (float(product.tax_rate) / 100.0)
                
                order_item = CustomerOrderItemModel(
                    product_id=product.id,
                    product_name=product.name,
                    sku=product.sku,
                    selling_price=product.selling_price,
                    tax_rate=product.tax_rate,
                    ordered_quantity=item_data.ordered_quantity,
                    line_total=line_total
                )
                order.items.append(order_item)
                
                subtotal += line_total
                tax_total += item_tax
                
            order.subtotal = subtotal
            order.tax_total = tax_total
            order.grand_total = subtotal + tax_total
            
        return await self.repository.update(order)

    async def update_status(self, order_id: UUID, new_status: OrderStatusEnum) -> CustomerOrderModel:
        order = await self.get_order(order_id)
        
        # Valid state transitions
        if order.status == OrderStatusEnum.CANCELLED or order.status == OrderStatusEnum.COMPLETED:
            raise InvalidOrderStatusException(f"Cannot transition from {order.status.value}")
            
        if order.status == OrderStatusEnum.DRAFT:
            if new_status not in [OrderStatusEnum.CONFIRMED, OrderStatusEnum.CANCELLED]:
                raise InvalidOrderStatusException(f"Invalid transition from DRAFT to {new_status.value}")
                
        elif order.status == OrderStatusEnum.CONFIRMED:
            if new_status not in [OrderStatusEnum.COMPLETED, OrderStatusEnum.CANCELLED]:
                raise InvalidOrderStatusException(f"Invalid transition from CONFIRMED to {new_status.value}")
                
        order.status = new_status
        return await self.repository.update(order)
