"""Product — API Routes"""

import os
import shutil
import uuid
from typing import Sequence
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.shared.dependencies import get_db
from app.product.schemas import ProductResponse, ProductCreate, ProductUpdate
from app.product.service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=list[ProductResponse])
async def list_products(
    include_inactive: bool = True,
    db: AsyncSession = Depends(get_db)
) -> Sequence[ProductResponse]:
    """Retrieve all products."""
    service = ProductService(db)
    return await service.get_all_products(include_inactive)

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> ProductResponse:
    """Get a specific product by ID."""
    service = ProductService(db)
    return await service.get_product(product_id)

@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db)
) -> ProductResponse:
    """Create a new product."""
    service = ProductService(db)
    return await service.create_product(data)

@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Upload a product image and return its URL."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
        
    ext = os.path.splitext(file.filename)[1]
    if not ext:
        ext = ".jpg"  # default extension if none
        
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    uploads_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data", "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    
    file_path = os.path.join(uploads_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"image_url": f"/uploads/{unique_filename}"}

@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: uuid.UUID,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db)
) -> ProductResponse:
    """Update a product."""
    service = ProductService(db)
    return await service.update_product(product_id, data)

@router.post("/{product_id}/activate", response_model=ProductResponse)
async def activate_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> ProductResponse:
    """Activate a product."""
    service = ProductService(db)
    return await service.activate_product(product_id)

@router.post("/{product_id}/deactivate", response_model=ProductResponse)
async def deactivate_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
) -> ProductResponse:
    """Deactivate a product."""
    service = ProductService(db)
    return await service.deactivate_product(product_id)
