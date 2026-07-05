"""Reporting — Request/Response Schemas"""

import uuid
import datetime
from typing import List, Optional
from pydantic import BaseModel

class DashboardSummaryResponse(BaseModel):
    total_products: int
    active_products: int
    total_warehouses: int
    total_suppliers: int
    current_inventory_value: float
    low_stock_products: int
    out_of_stock_products: int

class InventoryReportItem(BaseModel):
    product_id: uuid.UUID
    product_name: str
    sku: str
    category_name: str
    warehouse_id: uuid.UUID
    warehouse_name: str
    current_quantity: int
    reserved_quantity: int
    available_quantity: int
    unit_cost: float
    inventory_value: float
    is_low_stock: bool

class SupplierSummaryItem(BaseModel):
    supplier_id: uuid.UUID
    supplier_name: str
    total_orders: int
    pending_orders: int
    fully_received_orders: int
    total_spent: float

class ProcurementReportResponse(BaseModel):
    total_purchase_orders: int
    total_goods_receipts: int
    pending_purchase_orders: int
    fully_received_purchase_orders: int
    supplier_summaries: List[SupplierSummaryItem]

class CommerceReportResponse(BaseModel):
    total_customer_orders: int
    draft_orders: int
    confirmed_orders: int
    completed_orders: int
    cancelled_orders: int
    total_reserved_inventory: int
    total_revenue: float

class StockMovementReportItem(BaseModel):
    id: uuid.UUID
    reference_number: str
    product_name: str
    warehouse_name: str
    movement_type: str
    quantity_changed: int
    balance_before: int
    balance_after: int
    reference_source: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime.datetime
    created_by: Optional[str] = None
