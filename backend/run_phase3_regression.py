import asyncio
import sys
import os
import httpx
from sqlalchemy import select
from pydantic import BaseModel

sys.path.insert(0, os.path.abspath('src'))
from app.db.session import async_session_factory
from app.main import app as fastapi_app  # This ensures all routers and models are loaded
from app.warehouse.models import WarehouseModel
from app.supplier.models import SupplierModel
from app.product.models import ProductModel
from app.category.models import CategoryModel
from app.brand.models import BrandModel
from app.inventory.models import InventoryModel
from app.stock_movement.models import StockMovementModel
from app.purchase_order.models import PurchaseOrderModel
from app.goods_receiving.models import GoodsReceiptModel

async def run_regression():
    async with async_session_factory() as session:
        # Fetch or create required seed data
        print("--- SETUP ---")
        warehouse = (await session.execute(select(WarehouseModel).limit(1))).scalars().first()
        supplier = (await session.execute(select(SupplierModel).limit(1))).scalars().first()
        products = (await session.execute(select(ProductModel).limit(2))).scalars().all()
        
        if not warehouse or not supplier or len(products) < 2:
            print("Missing seed data (warehouse, supplier, or products). Please ensure they exist.")
            return

        prod1 = products[0]
        prod2 = products[1]
        
        # Set initial inventory via direct DB manipulation to match test case exactly (50 and 20)
        inv1 = (await session.execute(select(InventoryModel).where(InventoryModel.product_id == prod1.id, InventoryModel.warehouse_id == warehouse.id))).scalars().first()
        if not inv1:
            inv1 = InventoryModel(product_id=prod1.id, warehouse_id=warehouse.id, current_quantity=50, reserved_quantity=10)
            session.add(inv1)
        else:
            inv1.current_quantity = 50
            inv1.reserved_quantity = 10
            
        inv2 = (await session.execute(select(InventoryModel).where(InventoryModel.product_id == prod2.id, InventoryModel.warehouse_id == warehouse.id))).scalars().first()
        if not inv2:
            inv2 = InventoryModel(product_id=prod2.id, warehouse_id=warehouse.id, current_quantity=20, reserved_quantity=0)
            session.add(inv2)
        else:
            inv2.current_quantity = 20
            inv2.reserved_quantity = 0
            
        await session.commit()
        
        # Verify Setup
        print("Stage 1 - Create PO")
        from app.purchase_order.service import PurchaseOrderService
        from app.purchase_order.schemas import PurchaseOrderCreate, PurchaseOrderItemCreate
        po_service = PurchaseOrderService(session)
        
        po_data = PurchaseOrderCreate(
            supplier_id=supplier.id,
            warehouse_id=warehouse.id,
            order_date="2026-07-05",
            items=[
                PurchaseOrderItemCreate(product_id=prod1.id, ordered_quantity=100, unit_cost=120.0, tax_rate=0),
                PurchaseOrderItemCreate(product_id=prod2.id, ordered_quantity=30, unit_cost=2500.0, tax_rate=0)
            ],
            created_by="Test Suite"
        )
        po = await po_service.create_purchase_order(po_data)
        assert po.status == "DRAFT"
        
        print("Stage 2 - Submit PO")
        po = await po_service.submit_purchase_order(po.id)
        assert po.status == "SUBMITTED"
        
        print("Stage 3 - Partial Goods Receiving")
        from app.goods_receiving.service import GoodsReceivingService
        from app.goods_receiving.schemas import GoodsReceiptCreate, GoodsReceiptItemCreate
        gr_service = GoodsReceivingService(session)
        
        gr_payload_1 = GoodsReceiptCreate(
            po_id=po.id,
            supplier_id=supplier.id,
            warehouse_id=warehouse.id,
            received_date="2026-07-06",
            items=[
                GoodsReceiptItemCreate(
                    po_item_id=po.items[0].id,
                    product_id=prod1.id,
                    ordered_quantity=100,
                    received_quantity=60,
                    accepted_quantity=60
                ),
                GoodsReceiptItemCreate(
                    po_item_id=po.items[1].id,
                    product_id=prod2.id,
                    ordered_quantity=30,
                    received_quantity=15,
                    accepted_quantity=15
                )
            ]
        )
        await gr_service.receive_goods(gr_payload_1)
        
        # Check inventory increased
        await session.refresh(inv1)
        await session.refresh(inv2)
        assert inv1.current_quantity == 110
        assert inv2.current_quantity == 35
        
        # Check PO status is PARTIALLY_RECEIVED
        await session.refresh(po)
        assert po.status == "PARTIALLY_RECEIVED"
        
        print("Stage 4 - Complete Goods Receiving")
        gr_payload_2 = GoodsReceiptCreate(
            po_id=po.id,
            supplier_id=supplier.id,
            warehouse_id=warehouse.id,
            received_date="2026-07-07",
            items=[
                GoodsReceiptItemCreate(
                    po_item_id=po.items[0].id,
                    product_id=prod1.id,
                    ordered_quantity=100,
                    received_quantity=40,
                    accepted_quantity=40
                ),
                GoodsReceiptItemCreate(
                    po_item_id=po.items[1].id,
                    product_id=prod2.id,
                    ordered_quantity=30,
                    received_quantity=15,
                    accepted_quantity=15
                )
            ]
        )
        await gr_service.receive_goods(gr_payload_2)
        
        # Check inventory increased
        await session.refresh(inv1)
        await session.refresh(inv2)
        assert inv1.current_quantity == 150
        assert inv2.current_quantity == 50
            
        # Check PO status is FULLY_RECEIVED
        await session.refresh(po)
        assert po.status == "FULLY_RECEIVED"
        
        print("Stage 5 & 6 - Database Integrity and Business Rules")
        # Stock Movements generated
        sm1_count = (await session.execute(select(StockMovementModel).where(StockMovementModel.product_id == prod1.id, StockMovementModel.movement_type == 'GOODS_RECEIVED'))).scalars().all()
        sm2_count = (await session.execute(select(StockMovementModel).where(StockMovementModel.product_id == prod2.id, StockMovementModel.movement_type == 'GOODS_RECEIVED'))).scalars().all()
        assert len(sm1_count) >= 2 # 2 from this test alone
        assert len(sm2_count) >= 2 # 2 from this test alone
        
        print("All assertions passed. Phase 3 PASS.")

            
if __name__ == "__main__":
    asyncio.run(run_regression())
