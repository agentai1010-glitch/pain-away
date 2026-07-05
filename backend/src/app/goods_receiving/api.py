"""Goods Receiving — API Routes"""

import uuid
from typing import Sequence
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.shared.dependencies import get_db
from app.goods_receiving.schemas import GoodsReceiptResponse, GoodsReceiptCreate
from app.goods_receiving.service import GoodsReceivingService

router = APIRouter(prefix="/goods-receiving", tags=["Goods Receiving"])

@router.get("", response_model=list[GoodsReceiptResponse])
async def list_goods_receipts(db: AsyncSession = Depends(get_db)) -> Sequence[GoodsReceiptResponse]:
    """Retrieve all goods receipts."""
    service = GoodsReceivingService(db)
    return await service.list_goods_receipts()

@router.get("/{receipt_id}", response_model=GoodsReceiptResponse)
async def get_goods_receipt(receipt_id: uuid.UUID, db: AsyncSession = Depends(get_db)) -> GoodsReceiptResponse:
    """Get a specific goods receipt."""
    service = GoodsReceivingService(db)
    return await service.get_goods_receipt(receipt_id)

@router.post("", response_model=GoodsReceiptResponse, status_code=201)
async def receive_goods(data: GoodsReceiptCreate, db: AsyncSession = Depends(get_db)) -> GoodsReceiptResponse:
    """Receive goods against a purchase order."""
    service = GoodsReceivingService(db)
    return await service.receive_goods(data)
