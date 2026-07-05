"""Reporting — Business Logic and Projections"""

import uuid
import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import joinedload

from app.product.models import ProductModel
from app.warehouse.models import WarehouseModel
from app.supplier.models import SupplierModel
from app.inventory.models import InventoryModel
from app.purchase_order.models import PurchaseOrderModel, PurchaseOrderStatusEnum
from app.goods_receiving.models import GoodsReceiptModel
from app.customer_order.models import CustomerOrderModel, OrderStatusEnum
from app.stock_movement.models import StockMovementModel
from app.category.models import CategoryModel

from .schemas import (
    DashboardSummaryResponse,
    InventoryReportItem,
    ProcurementReportResponse,
    SupplierSummaryItem,
    CommerceReportResponse,
    StockMovementReportItem,
)

class ReportingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_dashboard_summary(self) -> DashboardSummaryResponse:
        # Total and active products
        total_products = (await self.db.execute(select(func.count(ProductModel.id)))).scalar_one()
        active_products = (await self.db.execute(select(func.count(ProductModel.id)).where(ProductModel.is_active == True))).scalar_one()
        
        # Warehouses and suppliers
        total_warehouses = (await self.db.execute(select(func.count(WarehouseModel.id)))).scalar_one()
        total_suppliers = (await self.db.execute(select(func.count(SupplierModel.id)))).scalar_one()
        
        # Inventory items
        inv_query = select(InventoryModel).options(joinedload(InventoryModel.product))
        inv_result = await self.db.execute(inv_query)
        inventories = inv_result.unique().scalars().all()
        
        current_inventory_value = 0.0
        low_stock_products = 0
        out_of_stock_products = 0
        
        for inv in inventories:
            cost = float(inv.product.cost_price) if inv.product else 0.0
            current_inventory_value += inv.current_quantity * cost
            
            if inv.current_quantity == 0:
                out_of_stock_products += 1
            elif inv.current_quantity <= inv.reorder_level:
                low_stock_products += 1
                
        return DashboardSummaryResponse(
            total_products=total_products,
            active_products=active_products,
            total_warehouses=total_warehouses,
            total_suppliers=total_suppliers,
            current_inventory_value=current_inventory_value,
            low_stock_products=low_stock_products,
            out_of_stock_products=out_of_stock_products
        )

    async def get_inventory_report(
        self, 
        search: Optional[str] = None, 
        warehouse_id: Optional[uuid.UUID] = None, 
        category_id: Optional[uuid.UUID] = None, 
        low_stock_only: bool = False
    ) -> List[InventoryReportItem]:
        query = select(InventoryModel).options(
            joinedload(InventoryModel.product).joinedload(ProductModel.category),
            joinedload(InventoryModel.warehouse)
        )
        
        if warehouse_id:
            query = query.where(InventoryModel.warehouse_id == warehouse_id)
            
        result = await self.db.execute(query)
        inventories = result.unique().scalars().all()
        
        items = []
        for inv in inventories:
            if not inv.product or not inv.warehouse:
                continue
                
            if category_id and inv.product.category_id != category_id:
                continue
                
            if search:
                s_lower = search.lower()
                if s_lower not in inv.product.name.lower() and s_lower not in inv.product.sku.lower():
                    continue
                    
            is_low = inv.current_quantity <= inv.reorder_level and inv.current_quantity > 0
            if low_stock_only and not is_low:
                continue
                
            cost = float(inv.product.cost_price)
            val = inv.current_quantity * cost
            
            items.append(InventoryReportItem(
                product_id=inv.product.id,
                product_name=inv.product.name,
                sku=inv.product.sku,
                category_name=inv.product.category.name if inv.product.category else "Uncategorized",
                warehouse_id=inv.warehouse.id,
                warehouse_name=inv.warehouse.name,
                current_quantity=inv.current_quantity,
                reserved_quantity=inv.reserved_quantity,
                available_quantity=inv.available_quantity,
                unit_cost=cost,
                inventory_value=val,
                is_low_stock=is_low
            ))
            
        return items

    async def get_procurement_report(self) -> ProcurementReportResponse:
        total_pos = (await self.db.execute(select(func.count(PurchaseOrderModel.id)))).scalar_one()
        total_grs = (await self.db.execute(select(func.count(GoodsReceiptModel.id)))).scalar_one()
        
        pending_pos = (await self.db.execute(
            select(func.count(PurchaseOrderModel.id)).where(
                PurchaseOrderModel.status.in_([PurchaseOrderStatusEnum.SUBMITTED, PurchaseOrderStatusEnum.PARTIALLY_RECEIVED])
            )
        )).scalar_one()
        
        fully_received_pos = (await self.db.execute(
            select(func.count(PurchaseOrderModel.id)).where(PurchaseOrderModel.status == PurchaseOrderStatusEnum.FULLY_RECEIVED)
        )).scalar_one()
        
        # Supplier summaries
        suppliers = (await self.db.execute(select(SupplierModel))).unique().scalars().all()
        pos = (await self.db.execute(select(PurchaseOrderModel))).unique().scalars().all()
        
        supplier_summaries = []
        for sup in suppliers:
            sup_pos = [po for po in pos if po.supplier_id == sup.id]
            total_orders = len(sup_pos)
            pending = len([po for po in sup_pos if po.status in [PurchaseOrderStatusEnum.SUBMITTED, PurchaseOrderStatusEnum.PARTIALLY_RECEIVED]])
            fully_received = len([po for po in sup_pos if po.status == PurchaseOrderStatusEnum.FULLY_RECEIVED])
            total_spent = sum([float(po.grand_total) for po in sup_pos if po.status != PurchaseOrderStatusEnum.CANCELLED])
            
            supplier_summaries.append(SupplierSummaryItem(
                supplier_id=sup.id,
                supplier_name=sup.name,
                total_orders=total_orders,
                pending_orders=pending,
                fully_received_orders=fully_received,
                total_spent=total_spent
            ))
            
        return ProcurementReportResponse(
            total_purchase_orders=total_pos,
            total_goods_receipts=total_grs,
            pending_purchase_orders=pending_pos,
            fully_received_purchase_orders=fully_received_pos,
            supplier_summaries=supplier_summaries
        )

    async def get_commerce_report(self) -> CommerceReportResponse:
        orders = (await self.db.execute(select(CustomerOrderModel).options(joinedload(CustomerOrderModel.items)))).unique().scalars().all()
        
        total = len(orders)
        draft = 0
        confirmed = 0
        completed = 0
        cancelled = 0
        reserved_inv = 0
        revenue = 0.0
        
        for o in orders:
            if o.status == OrderStatusEnum.DRAFT:
                draft += 1
            elif o.status == OrderStatusEnum.CONFIRMED:
                confirmed += 1
                for item in o.items:
                    reserved_inv += item.ordered_quantity
            elif o.status == OrderStatusEnum.COMPLETED:
                completed += 1
                revenue += float(o.grand_total)
            elif o.status == OrderStatusEnum.CANCELLED:
                cancelled += 1
                
        return CommerceReportResponse(
            total_customer_orders=total,
            draft_orders=draft,
            confirmed_orders=confirmed,
            completed_orders=completed,
            cancelled_orders=cancelled,
            total_reserved_inventory=reserved_inv,
            total_revenue=revenue
        )

    async def get_stock_movement_report(
        self,
        product_id: Optional[uuid.UUID] = None,
        warehouse_id: Optional[uuid.UUID] = None,
        movement_type: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None
    ) -> List[StockMovementReportItem]:
        query = select(StockMovementModel).options(
            joinedload(StockMovementModel.product),
            joinedload(StockMovementModel.warehouse)
        ).order_by(StockMovementModel.created_at.desc())
        
        if product_id:
            query = query.where(StockMovementModel.product_id == product_id)
        if warehouse_id:
            query = query.where(StockMovementModel.warehouse_id == warehouse_id)
        if movement_type:
            query = query.where(StockMovementModel.movement_type == movement_type)
            
        result = await self.db.execute(query)
        movements = result.unique().scalars().all()
        
        items = []
        for m in movements:
            if start_date:
                dt_start = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()
                if m.created_at.date() < dt_start:
                    continue
            if end_date:
                dt_end = datetime.datetime.strptime(end_date, "%Y-%m-%d").date()
                if m.created_at.date() > dt_end:
                    continue
                    
            items.append(StockMovementReportItem(
                id=m.id,
                reference_number=m.reference_number,
                product_name=m.product.name if m.product else "Unknown",
                warehouse_name=m.warehouse.name if m.warehouse else "Unknown",
                movement_type=m.movement_type.value if hasattr(m.movement_type, 'value') else str(m.movement_type),
                quantity_changed=m.quantity_changed,
                balance_before=m.balance_before,
                balance_after=m.balance_after,
                reference_source=m.reference_source,
                notes=m.notes,
                created_at=m.created_at,
                created_by=m.created_by
            ))
            
        return items
