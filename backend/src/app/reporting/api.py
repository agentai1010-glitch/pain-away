"""Reporting — API Routes"""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.shared.dependencies import get_db
from .service import ReportingService
from .schemas import (
    DashboardSummaryResponse,
    InventoryReportItem,
    ProcurementReportResponse,
    CommerceReportResponse,
    StockMovementReportItem,
)

router = APIRouter(prefix="/reports", tags=["Reports"])

def get_reporting_service(db: AsyncSession = Depends(get_db)) -> ReportingService:
    return ReportingService(db)

@router.get("/dashboard-summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    service: ReportingService = Depends(get_reporting_service)
):
    return await service.get_dashboard_summary()

@router.get("/inventory", response_model=List[InventoryReportItem])
async def get_inventory_report(
    search: Optional[str] = Query(None, description="Search product name or SKU"),
    warehouse_id: Optional[uuid.UUID] = Query(None, description="Filter by warehouse ID"),
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by category ID"),
    low_stock_only: bool = Query(False, description="Filter low stock items only"),
    service: ReportingService = Depends(get_reporting_service)
):
    return await service.get_inventory_report(
        search=search,
        warehouse_id=warehouse_id,
        category_id=category_id,
        low_stock_only=low_stock_only
    )

@router.get("/procurement", response_model=ProcurementReportResponse)
async def get_procurement_report(
    service: ReportingService = Depends(get_reporting_service)
):
    return await service.get_procurement_report()

@router.get("/commerce", response_model=CommerceReportResponse)
async def get_commerce_report(
    service: ReportingService = Depends(get_reporting_service)
):
    return await service.get_commerce_report()

@router.get("/stock-movements", response_model=List[StockMovementReportItem])
async def get_stock_movement_report(
    product_id: Optional[uuid.UUID] = Query(None, description="Filter by product ID"),
    warehouse_id: Optional[uuid.UUID] = Query(None, description="Filter by warehouse ID"),
    movement_type: Optional[str] = Query(None, description="Filter by movement type"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
    service: ReportingService = Depends(get_reporting_service)
):
    return await service.get_stock_movement_report(
        product_id=product_id,
        warehouse_id=warehouse_id,
        movement_type=movement_type,
        start_date=start_date,
        end_date=end_date
    )
