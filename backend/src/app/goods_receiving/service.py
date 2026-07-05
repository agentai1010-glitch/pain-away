"""Goods Receiving — Business Logic"""

import uuid
import datetime
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.goods_receiving.models import GoodsReceiptModel, GoodsReceiptItemModel
from app.goods_receiving.repository import GoodsReceivingRepository
from app.goods_receiving.schemas import GoodsReceiptCreate
from app.goods_receiving.exceptions import GoodsReceiptNotFoundException, InvalidGoodsReceivingException

from app.purchase_order.models import PurchaseOrderModel, PurchaseOrderStatusEnum, PurchaseOrderItemModel
from app.stock_movement.service import StockMovementService
from app.stock_movement.schemas import StockMovementCreate

class GoodsReceivingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = GoodsReceivingRepository(db)
        self.stock_service = StockMovementService(db)

    async def list_goods_receipts(self) -> Sequence[GoodsReceiptModel]:
        return await self.repo.list_all()

    async def get_goods_receipt(self, receipt_id: uuid.UUID) -> GoodsReceiptModel:
        receipt = await self.repo.get_by_id(receipt_id)
        if not receipt:
            raise GoodsReceiptNotFoundException()
        return receipt

    async def receive_goods(self, data: GoodsReceiptCreate) -> GoodsReceiptModel:
        # Fetch the Purchase Order
        po_query = select(PurchaseOrderModel).where(PurchaseOrderModel.id == data.po_id)
        po_result = await self.db.execute(po_query)
        po = po_result.scalars().first()

        if not po:
            raise InvalidGoodsReceivingException("Purchase order not found")

        if po.status not in [PurchaseOrderStatusEnum.SUBMITTED, PurchaseOrderStatusEnum.PARTIALLY_RECEIVED]:
            raise InvalidGoodsReceivingException("Only Submitted or Partially Received purchase orders can receive goods")

        # Create Receipt Header
        receipt_number = f"GR-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:6].upper()}"
        receipt = GoodsReceiptModel(
            receipt_number=receipt_number,
            po_id=po.id,
            supplier_id=po.supplier_id,
            warehouse_id=po.warehouse_id,
            received_date=data.received_date,
            notes=data.notes,
            created_by=data.created_by
        )
        
        receipt_items = []
        # Process each item
        for item_data in data.items:
            # Fetch PO Item to validate quantities
            po_item_query = select(PurchaseOrderItemModel).where(PurchaseOrderItemModel.id == item_data.po_item_id)
            po_item_result = await self.db.execute(po_item_query)
            po_item = po_item_result.scalars().first()

            if not po_item:
                raise InvalidGoodsReceivingException(f"Purchase order item {item_data.po_item_id} not found")

            if po_item.product_id != item_data.product_id:
                raise InvalidGoodsReceivingException("Product ID mismatch for purchase order item")

            if item_data.accepted_quantity > item_data.received_quantity:
                raise InvalidGoodsReceivingException("Accepted quantity cannot be greater than received quantity")

            # Check previous receipts for this PO Item to calculate remaining quantity
            prev_receipts_query = select(GoodsReceiptItemModel).where(GoodsReceiptItemModel.po_item_id == po_item.id)
            prev_receipts_result = await self.db.execute(prev_receipts_query)
            prev_receipts = prev_receipts_result.scalars().all()
            
            previously_accepted = sum(r.accepted_quantity for r in prev_receipts)
            remaining_quantity = po_item.ordered_quantity - previously_accepted
            
            if item_data.accepted_quantity > remaining_quantity:
                raise InvalidGoodsReceivingException(f"Cannot accept {item_data.accepted_quantity}. Only {remaining_quantity} remaining.")

            new_total_accepted = previously_accepted + item_data.accepted_quantity
            line_status = "COMPLETE" if new_total_accepted >= po_item.ordered_quantity else "PARTIAL"

            # Create Receipt Item
            receipt_item = GoodsReceiptItemModel(
                po_item_id=po_item.id,
                product_id=po_item.product_id,
                ordered_quantity=po_item.ordered_quantity,
                received_quantity=item_data.received_quantity,
                accepted_quantity=item_data.accepted_quantity,
                line_status=line_status
            )
            receipt_items.append(receipt_item)

            # Automatically Update Inventory via Stock Movement
            if item_data.accepted_quantity > 0:
                movement_data = StockMovementCreate(
                    product_id=po_item.product_id,
                    warehouse_id=po.warehouse_id,
                    movement_type="GOODS_RECEIVED",
                    quantity_changed=item_data.accepted_quantity,
                    reference_source="GOODS_RECEIPT",
                    notes=f"Receipt {receipt_number} for PO {po.po_number}",
                    created_by=data.created_by or "System"
                )
                await self.stock_service.record_movement(movement_data)

        receipt.items = receipt_items

        # Check PO Status
        # We need to see if ALL po_items are fully received now
        po_items_query = select(PurchaseOrderItemModel).where(PurchaseOrderItemModel.po_id == po.id)
        po_items_result = await self.db.execute(po_items_query)
        all_po_items = po_items_result.scalars().all()
        
        all_complete = True
        any_received = False
        
        for p_item in all_po_items:
            # sum from previous + current
            prev_sum_query = select(GoodsReceiptItemModel).where(GoodsReceiptItemModel.po_item_id == p_item.id)
            prev_sum_res = await self.db.execute(prev_sum_query)
            old_accepted = sum(r.accepted_quantity for r in prev_sum_res.scalars().all())
            
            current_accepted = sum(i.accepted_quantity for i in data.items if i.po_item_id == p_item.id)
            total = old_accepted + current_accepted
            
            if total > 0:
                any_received = True
            
            if total < p_item.ordered_quantity:
                all_complete = False

        if all_complete:
            po.status = PurchaseOrderStatusEnum.FULLY_RECEIVED
        elif any_received:
            po.status = PurchaseOrderStatusEnum.PARTIALLY_RECEIVED

        self.db.add(po)

        return await self.repo.create(receipt)
