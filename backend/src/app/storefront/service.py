"""Storefront — Business Logic"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.product.models import ProductModel
from app.category.models import CategoryModel
from app.brand.models import BrandModel
from app.inventory.models import InventoryModel
from app.storefront.schemas import StorefrontProductResponse, StorefrontCategoryResponse, StorefrontBrandResponse

class StorefrontService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_public_products(self) -> list[StorefrontProductResponse]:
        # Query active products
        stmt = (
            select(
                ProductModel,
                CategoryModel.name.label("category_name"),
                BrandModel.name.label("brand_name"),
                func.sum(func.greatest(0, InventoryModel.current_quantity - InventoryModel.reserved_quantity)).label("available_quantity")
            )
            .outerjoin(CategoryModel, ProductModel.category_id == CategoryModel.id)
            .outerjoin(BrandModel, ProductModel.brand_id == BrandModel.id)
            .outerjoin(InventoryModel, ProductModel.id == InventoryModel.product_id)
            .where(ProductModel.is_active == True)
            .group_by(ProductModel.id, CategoryModel.name, BrandModel.name)
            .order_by(ProductModel.name)
        )
        
        result = await self.session.execute(stmt)
        rows = result.all()
        
        responses = []
        for product, category_name, brand_name, available_quantity in rows:
            responses.append(StorefrontProductResponse(
                id=product.id,
                name=product.name,
                sku=product.sku,
                description=product.description,
                selling_price=float(product.selling_price),
                image_url=product.image_url,
                category_id=product.category_id,
                category_name=category_name,
                brand_id=product.brand_id,
                brand_name=brand_name,
                available_quantity=int(available_quantity or 0),
                is_active=product.is_active
            ))
            
        return responses

    async def get_public_categories(self) -> list[StorefrontCategoryResponse]:
        stmt = select(CategoryModel).where(CategoryModel.is_active == True).order_by(CategoryModel.name)
        result = await self.session.execute(stmt)
        categories = result.scalars().all()
        return [
            StorefrontCategoryResponse(
                id=c.id,
                name=c.name,
                description=c.description
            ) for c in categories
        ]

    async def get_public_brands(self) -> list[StorefrontBrandResponse]:
        stmt = select(BrandModel).where(BrandModel.is_active == True).order_by(BrandModel.name)
        result = await self.session.execute(stmt)
        brands = result.scalars().all()
        return [
            StorefrontBrandResponse(
                id=b.id,
                name=b.name,
                description=b.description
            ) for b in brands
        ]
