"""Product — Business Logic"""

import uuid
from typing import Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from app.product.models import ProductModel
from app.product.schemas import ProductCreate, ProductUpdate
from app.product.repository import ProductRepository
from app.product.exceptions import ProductNotFound, DuplicateProductSKU

class ProductService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = ProductRepository(session)

    async def get_all_products(self, include_inactive: bool = True) -> Sequence[ProductModel]:
        return await self.repo.get_all(include_inactive)

    async def get_product(self, product_id: uuid.UUID) -> ProductModel:
        product = await self.repo.get_by_id(product_id)
        if not product:
            raise ProductNotFound()
        return product

    async def create_product(self, data: ProductCreate) -> ProductModel:
        existing = await self.repo.get_by_sku(data.sku)
        if existing:
            raise DuplicateProductSKU()

        product = ProductModel(
            name=data.name,
            sku=data.sku,
            barcode=data.barcode,
            description=data.description,
            selling_price=data.selling_price,
            cost_price=data.cost_price,
            tax_rate=data.tax_rate,
            image_url=data.image_url,
            is_active=True
        )
        return await self.repo.create(product)

    async def update_product(self, product_id: uuid.UUID, data: ProductUpdate) -> ProductModel:
        product = await self.get_product(product_id)
        
        if data.sku is not None and data.sku != product.sku:
            existing = await self.repo.get_by_sku(data.sku)
            if existing:
                raise DuplicateProductSKU()
                
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)
            
        return await self.repo.update(product)

    async def activate_product(self, product_id: uuid.UUID) -> ProductModel:
        product = await self.get_product(product_id)
        product.is_active = True
        return await self.repo.update(product)
        
    async def deactivate_product(self, product_id: uuid.UUID) -> ProductModel:
        product = await self.get_product(product_id)
        product.is_active = False
        return await self.repo.update(product)
