"""Purchase Order — Business Logic"""

import uuid
import datetime
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from app.purchase_order.models import PurchaseOrderModel, PurchaseOrderItemModel, PurchaseOrderStatusEnum
from app.purchase_order.repository import PurchaseOrderRepository
from app.purchase_order.schemas import PurchaseOrderCreate, PurchaseOrderUpdate
from app.purchase_order.exceptions import PurchaseOrderNotFoundException, InvalidPurchaseOrderStatusException

class PurchaseOrderService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = PurchaseOrderRepository(db)

    async def list_purchase_orders(self) -> Sequence[PurchaseOrderModel]:
        return await self.repo.list_all()

    async def get_purchase_order(self, po_id: uuid.UUID) -> PurchaseOrderModel:
        po = await self.repo.get_by_id(po_id)
        if not po:
            raise PurchaseOrderNotFoundException()
        return po

    def _calculate_totals(self, items: list[PurchaseOrderItemModel]) -> tuple[float, float, float]:
        subtotal = 0.0
        tax_total = 0.0
        
        for item in items:
            subtotal += item.line_total
            tax_amount = item.line_total * (item.tax_rate / 100)
            tax_total += tax_amount
            
        grand_total = subtotal + tax_total
        return subtotal, tax_total, grand_total

    async def create_purchase_order(self, data: PurchaseOrderCreate) -> PurchaseOrderModel:
        po_number = f"PO-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:6].upper()}"
        
        po = PurchaseOrderModel(
            po_number=po_number,
            supplier_id=data.supplier_id,
            warehouse_id=data.warehouse_id,
            order_date=data.order_date,
            expected_delivery_date=data.expected_delivery_date,
            status=PurchaseOrderStatusEnum.DRAFT,
            notes=data.notes,
            created_by=data.created_by
        )
        
        items = []
        for item_data in data.items:
            line_total = item_data.ordered_quantity * item_data.unit_cost
            item = PurchaseOrderItemModel(
                product_id=item_data.product_id,
                ordered_quantity=item_data.ordered_quantity,
                unit_cost=item_data.unit_cost,
                tax_rate=item_data.tax_rate,
                line_total=line_total
            )
            items.append(item)
            
        po.items = items
        sub, tax, grand = self._calculate_totals(items)
        po.subtotal = sub
        po.tax_total = tax
        po.grand_total = grand

        return await self.repo.create(po)

    async def update_purchase_order(self, po_id: uuid.UUID, data: PurchaseOrderUpdate) -> PurchaseOrderModel:
        po = await self.get_purchase_order(po_id)
        
        if po.status != PurchaseOrderStatusEnum.DRAFT:
            raise InvalidPurchaseOrderStatusException("Only draft purchase orders can be updated")
            
        if data.supplier_id:
            po.supplier_id = data.supplier_id
        if data.warehouse_id:
            po.warehouse_id = data.warehouse_id
        if data.order_date:
            po.order_date = data.order_date
        if data.expected_delivery_date:
            po.expected_delivery_date = data.expected_delivery_date
        if data.notes is not None:
            po.notes = data.notes
            
        if data.items is not None:
            # Recreate items
            self.db.expunge_all() # safe approach, or manually delete existing items and create new ones
            for old_item in po.items:
                await self.db.delete(old_item)
                
            new_items = []
            for item_data in data.items:
                line_total = item_data.ordered_quantity * item_data.unit_cost
                item = PurchaseOrderItemModel(
                    po_id=po.id,
                    product_id=item_data.product_id,
                    ordered_quantity=item_data.ordered_quantity,
                    unit_cost=item_data.unit_cost,
                    tax_rate=item_data.tax_rate,
                    line_total=line_total
                )
                new_items.append(item)
                self.db.add(item)
                
            po.items = new_items
            sub, tax, grand = self._calculate_totals(new_items)
            po.subtotal = sub
            po.tax_total = tax
            po.grand_total = grand
            
        return await self.repo.update(po)

    async def submit_purchase_order(self, po_id: uuid.UUID) -> PurchaseOrderModel:
        po = await self.get_purchase_order(po_id)
        
        if po.status != PurchaseOrderStatusEnum.DRAFT:
            raise InvalidPurchaseOrderStatusException("Only draft purchase orders can be submitted")
            
        po.status = PurchaseOrderStatusEnum.SUBMITTED
        return await self.repo.update(po)
