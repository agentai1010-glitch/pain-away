import asyncio
import sys
import os
sys.path.insert(0, os.path.abspath('src'))
import httpx
from sqlalchemy import select
from app.db.session import SessionLocal
from app.product.models import ProductModel
from app.warehouse.models import WarehouseModel

async def seed_stock():
    async with SessionLocal() as session:
        # Get first product
        prod_result = await session.execute(select(ProductModel).limit(1))
        product = prod_result.scalars().first()
        
        if not product:
            print("Error: No products found in the database. Please create one in the UI first.")
            return

        # Get first warehouse
        wh_result = await session.execute(select(WarehouseModel).limit(1))
        warehouse = wh_result.scalars().first()
        
        if not warehouse:
            print("Error: No warehouses found in the database. Please create one in the UI first.")
            return

        print(f"Found Product: {product.name} ({product.id})")
        print(f"Found Warehouse: {warehouse.name} ({warehouse.id})")

        # Send API Request
        payload = {
            "product_id": str(product.id),
            "warehouse_id": str(warehouse.id),
            "movement_type": "OPENING_STOCK",
            "quantity_changed": 150,
            "reference_source": "INITIAL_SEED",
            "notes": "Testing Capability 7 from automatic seed script",
            "created_by": "System Admin"
        }

        print("\nSending POST request to /api/v1/stock-movements...")
        
        async with httpx.AsyncClient() as client:
            response = await client.post("http://localhost:8000/api/v1/stock-movements", json=payload)
            
            if response.status_code == 201:
                print("Success! Response:")
                print(response.json())
            else:
                print(f"Failed! Status: {response.status_code}")
                print(response.text)

if __name__ == "__main__":
    asyncio.run(seed_stock())
