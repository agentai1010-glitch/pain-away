import asyncio
from app.db.session import async_session_factory
from app.product.service import ProductService
from sqlalchemy import select
from app.product.models import ProductModel

async def test():
    async with async_session_factory() as db:
        result = await db.execute(select(ProductModel))
        product = result.scalars().first()
        if not product:
            print("No product")
            return
        service = ProductService(db)
        print("Deactivating", product.id)
        await service.deactivate_product(product.id)
        print("Committing...")
        try:
            await db.commit()
            print("Done!")
        except Exception as e:
            import traceback
            traceback.print_exc()

asyncio.run(test())
